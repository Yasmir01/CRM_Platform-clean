import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../api/_db';
import { getUserOr401 } from '../../src/utils/authz';
import { notify } from '../../src/lib/notify';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const auth = getUserOr401(req, res);
  if (!auth) return;
  const senderId = String((auth as any).sub || (auth as any).id);

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const threadId = String(body.threadId || '');
    const content = String(body.content || '').trim();
    if (!threadId || !content) return res.status(400).json({ error: 'threadId and content required' });

    const thread = await prisma.messageThread.findUnique({ where: { id: threadId } });
    if (!thread) return res.status(404).json({ error: 'thread not found' });

    const msg = await prisma.message.create({ data: { threadId, senderId, content } });

    // Notify other users in org (simplified ACL)
    const others = await prisma.user.findMany({ where: { orgId: thread.orgId, id: { not: senderId } }, select: { id: true, email: true } });
    for (const u of others) {
      await notify({
        userId: u.id,
        email: u.email || undefined,
        type: 'new_message',
        title: thread.subject || 'New Message',
        message: content.length > 80 ? content.slice(0, 77) + '...' : content,
        meta: { threadId },
      });
    }

    return res.status(200).json(msg);
  } catch (e: any) {
    console.error('message send error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
