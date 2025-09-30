import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { getUserOr401 } from '../../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;
  const userId = String((user as any).sub || (user as any).id || '');
  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!dbUser) return res.status(401).json({ error: 'Unauthorized' });
  if (String(dbUser.role || '').toUpperCase() !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });

  const id = (req.query && (req.query as any).id) ? String((req.query as any).id) : null;
  if (!id) return res.status(400).json({ error: 'Missing id' });

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const plan = String(body.plan || 'FREE');
    if (!['FREE','PRO','ENTERPRISE'].includes(plan.toUpperCase())) return res.status(400).json({ error: 'Invalid plan' });

    const updated = await prisma.account.update({ where: { id }, data: { plan: plan.toUpperCase() as any } });
    return res.status(200).json(updated);
  } catch (e: any) {
    console.error('super-admin accounts update error', e?.message || e);
    return res.status(500).json({ error: 'Server error' });
  }
}
