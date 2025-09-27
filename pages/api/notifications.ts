import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_db';
import { getUserOr401 } from '../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const userId = String((user as any).sub || (user as any).id);
    const notes = await prisma.messageNotification.findMany({
      where: { userId },
      include: { message: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return res.status(200).json(notes);
  } catch (e: any) {
    console.error('notifications list error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
