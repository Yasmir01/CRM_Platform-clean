import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const role = String((user as any).role || '').toUpperCase();
    if (!['MANAGER','ADMIN','SUPER_ADMIN'].includes(role)) return res.status(401).json({ error: 'Unauthorized' });

    const users = await prisma.user.findMany({
      where: { role: { in: ['MANAGER','ADMIN','VENDOR'] as any } },
      select: { id: true, name: true, email: true, role: true },
      take: 200,
    });
    return res.status(200).json(users);
  } catch (e: any) {
    console.error('vendors list error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
