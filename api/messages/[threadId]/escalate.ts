import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { getUserOr401 } from '../../../src/utils/authz';
import { normalizeRoleString } from '../../../src/lib/messages/rules';

function toPrismaEnumRole(r: string): 'ADMIN' | 'SUPER_ADMIN' | 'MANAGER' | 'OWNER' | 'TENANT' | 'VENDOR' | undefined {
  const n = normalizeRoleString(r);
  switch (n) {
    case 'superadmin': return 'SUPER_ADMIN';
    case 'admin': return 'ADMIN';
    case 'manager': return 'MANAGER';
    case 'owner': return 'OWNER';
    case 'tenant': return 'TENANT';
    case 'vendor': return 'VENDOR';
    default: return undefined;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const userId = String((user as any).sub || (user as any).id);
    const currentRole = normalizeRoleString(String((user as any).role || (Array.isArray((user as any).roles) ? (user as any).roles[0] : 'tenant')));
    if (!['tenant', 'manager', 'owner'].includes(currentRole)) return res.status(403).json({ error: 'Not allowed to escalate' });

    const threadId = String((req.query as any)?.threadId || '');
    if (!threadId) return res.status(400).json({ error: 'Missing threadId' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const toRoleRaw = String(body.toRole || '');
    const reason = body.reason ? String(body.reason) : undefined;
    const toRole = normalizeRoleString(toRoleRaw);
    if (!['admin', 'superadmin'].includes(toRole)) return res.status(400).json({ error: 'Invalid toRole' });

    const escalation = await prisma.messageEscalation.create({ data: { threadId, fromRole: currentRole, toRole, reason } });

    const prismaRole = toPrismaEnumRole(toRole);
    if (prismaRole) {
      const adminTarget = await prisma.user.findFirst({ where: { role: prismaRole } });
      if (adminTarget) {
        await prisma.messageParticipant.upsert({
          where: { threadId_userId: { threadId, userId: adminTarget.id } },
          update: {},
          create: { threadId, userId: adminTarget.id, role: toRole },
        });
      }
    }

    return res.status(200).json(escalation);
  } catch (e: any) {
    console.error('escalate error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
