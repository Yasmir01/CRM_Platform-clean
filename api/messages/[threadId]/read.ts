import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { getUserOr401 } from '../../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const userId = String((user as any).sub || (user as any).id);
    const threadId = String((req.query as any)?.threadId || '');
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const messageId = String(body.messageId || '');
    if (!messageId || !threadId) return res.status(400).json({ error: 'Missing fields' });

    // Ensure user is participant of thread
    const cnt = await prisma.messageParticipant.count({ where: { threadId, userId } });
    if (!cnt) return res.status(403).json({ error: 'Forbidden' });

    await prisma.messageRead.upsert({
      where: { messageId_userId: { messageId, userId } },
      update: { readAt: new Date() },
      create: { messageId, userId },
    });

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('message read error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
