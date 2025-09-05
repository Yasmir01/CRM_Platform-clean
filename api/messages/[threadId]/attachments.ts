import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { getUserOr401 } from '../../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;
  const userId = String((user as any).sub || (user as any).id);
  const threadId = String((req.query as any)?.threadId || '');
  if (!threadId) return res.status(400).json({ error: 'Missing threadId' });

  // Ensure user is a participant
  const isParticipant = await prisma.messageParticipant.count({ where: { threadId, userId } });
  if (!isParticipant) return res.status(403).json({ error: 'Forbidden' });

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const messageId = String(body.messageId || '');
    const key = String(body.key || body.fileUrl || '');
    const fileType = String(body.fileType || 'application/octet-stream');
    const fileName = String(body.fileName || 'file');
    if (!messageId || !key) return res.status(400).json({ error: 'Missing fields' });

    // Optionally build public URL if desired; keep S3 key as fileUrl by default
    const fileUrl = key;

    const attachment = await prisma.messageAttachment.create({
      data: { messageId, fileUrl, fileType, fileName },
    });
    return res.status(200).json(attachment);
  } catch (e: any) {
    console.error('attachment create error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
