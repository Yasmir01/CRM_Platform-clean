import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = getUserOr401(req, res);
  if (!user) return;
  const userId = String((user as any).sub || (user as any).id);

  try {
    const items = await prisma.userNotification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return res.status(200).json(items);
  } catch (e: any) {
    console.error('notifications list error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
