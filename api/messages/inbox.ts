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

  try {
    const userId = String((user as any).sub || (user as any).id);
    const messages = await prisma.directMessage.findMany({
      where: { receiverId: userId },
      include: { sender: { select: { id: true, name: true, email: true } }, property: { select: { address: true } }, attachments: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return res.status(200).json(messages);
  } catch (e: any) {
    console.error('inbox error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
