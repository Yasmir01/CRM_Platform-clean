import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../../api/_db';
import { getUserOr401 } from '../../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const auth = getUserOr401(req, res);
  if (!auth) return;
  const userId = String((auth as any).sub || (auth as any).id);

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).json({ error: 'unauthorized' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const subject = String(body.subject || '').trim();
    const propertyId = body.propertyId ? String(body.propertyId) : null;
    const content = String(body.content || '').trim();
    if (!subject || !content) return res.status(400).json({ error: 'subject and content required' });

    const thread = await prisma.messageThread.create({
      data: {
        orgId: user.orgId,
        subject,
        propertyId: propertyId || undefined,
        messages: { create: { senderId: user.id, content } },
      },
      include: { messages: true },
    });

    return res.status(200).json(thread);
  } catch (e: any) {
    console.error('thread create error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
