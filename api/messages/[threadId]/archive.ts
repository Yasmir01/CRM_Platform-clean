import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { getUserOr401 } from '../../../src/utils/authz';
import { normalizeRoleString } from '../../../src/lib/messages/rules';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const userId = String((user as any).sub || (user as any).id);
    const role = normalizeRoleString(String((user as any).role || (Array.isArray((user as any).roles) ? (user as any).roles[0] : 'tenant')));
    if (!['admin', 'superadmin'].includes(role)) return res.status(403).json({ error: 'Not allowed to archive' });

    const threadId = String((req.query as any)?.threadId || '');
    if (!threadId) return res.status(400).json({ error: 'Missing threadId' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const reason = body.reason ? String(body.reason) : undefined;

    const archived = await prisma.archivedThread.upsert({
      where: { threadId },
      update: { archivedBy: userId, reason },
      create: { threadId, archivedBy: userId, reason },
    });

    return res.status(200).json(archived);
  } catch (e: any) {
    console.error('archive error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
