import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;
  const userId = String((user as any).sub || (user as any).id);
  const threadId = String((req.query as any)?.threadId || '');
  if (!threadId) return res.status(400).json({ error: 'Missing threadId' });

  // Ensure user is a participant
  const isParticipant = await prisma.messageParticipant.count({ where: { threadId, userId } });
  if (!isParticipant) return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'GET') {
    try {
      const messages = await prisma.message.findMany({
        where: { threadId },
        include: { sender: true },
        orderBy: { createdAt: 'asc' },
        take: 500,
      });
      return res.status(200).json(messages);
    } catch (e: any) {
      console.error('thread messages error', e?.message || e);
      return res.status(500).json({ error: 'failed' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const text = String(body.body || '').trim();
      if (!text) return res.status(400).json({ error: 'Missing body' });

      const message = await prisma.message.create({ data: { threadId, senderId: userId, body: text } });
      await prisma.messageThread.update({ where: { id: threadId }, data: { updatedAt: new Date() } });
      return res.status(200).json(message);
    } catch (e: any) {
      console.error('thread post error', e?.message || e);
      return res.status(500).json({ error: 'failed' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method Not Allowed' });
}
