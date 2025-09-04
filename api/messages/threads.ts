import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;
  const userId = String((user as any).sub || (user as any).id);

  if (req.method === 'GET') {
    try {
      const threads = await prisma.messageThread.findMany({
        where: { participants: { some: { userId } } },
        include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
        orderBy: { updatedAt: 'desc' },
        take: 100,
      });
      return res.status(200).json(threads);
    } catch (e: any) {
      console.error('threads list error', e?.message || e);
      return res.status(500).json({ error: 'failed' });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const subject = String(body.subject || '').trim();
      const participants: any[] = Array.isArray(body.participants) ? body.participants : [];
      const messageBody = String(body.body || '').trim();
      if (!subject || !messageBody) return res.status(400).json({ error: 'Missing fields' });

      const currentRole = String((user as any).role || (Array.isArray((user as any).roles) ? (user as any).roles[0] : 'tenant'));

      const thread = await prisma.messageThread.create({
        data: {
          subject,
          participants: {
            create: [
              { userId, role: currentRole },
              ...participants.map((p: any) => ({ userId: String(p.id), role: String(p.role || 'user') })),
            ],
          },
          messages: { create: { senderId: userId, body: messageBody } },
        },
        include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
      });

      return res.status(200).json(thread);
    } catch (e: any) {
      console.error('thread create error', e?.message || e);
      return res.status(500).json({ error: 'failed' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method Not Allowed' });
}
