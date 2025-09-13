import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../api/_db';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;
  const userId = String((user as any).sub || (user as any).id || '');
  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!dbUser) return res.status(401).json({ error: 'Unauthorized' });
  if (String(dbUser.role || '').toUpperCase() !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const accounts = await prisma.account.findMany({ select: { id: true, name: true, plan: true } });
    return res.status(200).json(accounts);
  } catch (e: any) {
    console.error('super-admin accounts list error', e?.message || e);
    return res.status(500).json({ error: 'Server error' });
  }
}
