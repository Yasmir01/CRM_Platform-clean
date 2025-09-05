import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';
import { notify } from '../../src/lib/notify';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const senderId = String((user as any).sub || (user as any).id);
    const receiverId = String(body.receiverId || '');
    const content = String(body.content || '').trim();
    const propertyId = body.propertyId ? String(body.propertyId) : undefined;

    if (!receiverId || !content) return res.status(400).json({ error: 'Missing fields' });

    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiver) return res.status(404).json({ error: 'Receiver not found' });

    const message = await prisma.directMessage.create({
      data: { senderId, receiverId, content, propertyId },
    });

    await notify({
      userId: receiverId,
      type: 'new_message',
      title: 'New Message',
      message: `You have a new message from ${(user as any).name || 'a user'}.`,
      meta: { link: '/crm/messages', messageId: message.id },
    });

    return res.status(200).json(message);
  } catch (e: any) {
    console.error('send message error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
