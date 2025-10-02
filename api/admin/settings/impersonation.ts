import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { ensurePermission } from '../../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = ensurePermission(req, res, 'users:manage');
  if (!user) return;
  if (String((user as any).role || '').toUpperCase() !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const orgId = String((user as any).orgId || '');
  if (!orgId) return res.status(400).json({ error: 'Missing orgId' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const allowImpersonation = Boolean(body.allowImpersonation);

  await prisma.orgSettings.upsert({
    where: { orgId },
    update: { allowImpersonation },
    create: { orgId, allowImpersonation },
  });

  return res.status(200).json({ ok: true, allowImpersonation });
}
