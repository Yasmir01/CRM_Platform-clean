import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';

function isAdminLike(user: any) {
  const rolesArr = Array.isArray(user?.roles) ? user.roles.map((r: string) => String(r).toLowerCase()) : [];
  const role = user?.role ? String(user.role).toLowerCase() : '';
  return rolesArr.includes('admin') || rolesArr.includes('superadmin') || role === 'admin' || role === 'super_admin';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const messageId = String(body.messageId || '').trim();
    const key = String(body.key || '').trim();
    const filename = String(body.filename || '').trim();
    const mimeType = String(body.mimeType || '').trim();

    if (!messageId || !key || !filename || !mimeType) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const msg = await prisma.directMessage.findUnique({ where: { id: messageId } });
    if (!msg) return res.status(404).json({ error: 'Message not found' });

    const uid = String((user as any).sub || (user as any).id);
    const allowed = isAdminLike(user) || msg.senderId === uid || (!!msg.receiverId && msg.receiverId === uid);
    if (!allowed) return res.status(403).json({ error: 'forbidden' });

    // Store a secure download proxy URL rather than public S3 URL
    const url = `/api/storage/download?key=${encodeURIComponent(key)}`;

    const attachment = await prisma.directMessageAttachment.create({
      data: { messageId, url, filename, mimeType },
    });

    return res.status(200).json(attachment);
  } catch (e: any) {
    console.error('attach error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
