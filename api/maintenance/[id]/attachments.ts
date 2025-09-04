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
    const threadId = String((req.query as any)?.id || '');
    if (!threadId) return res.status(400).json({ error: 'Missing id' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const key = String(body.key || body.fileUrl || '');
    const fileType = String(body.fileType || 'application/octet-stream');
    const fileName = String(body.fileName || 'file');
    if (!key) return res.status(400).json({ error: 'Missing file key' });

    const reqRec = await prisma.maintenanceRequest.findUnique({ where: { id: threadId } });
    if (!reqRec) return res.status(404).json({ error: 'Request not found' });

    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    const role = String((user as any).role || (Array.isArray((user as any).roles) ? (user as any).roles[0] : '')).toUpperCase();
    const isSuper = role === 'SUPER_ADMIN';
    const isAdminish = role === 'ADMIN' || role === 'MANAGER' || role === 'OWNER';
    const allowed = isSuper || reqRec.tenantId === userId || (isAdminish && dbUser && reqRec.orgId && dbUser.orgId === reqRec.orgId);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const fileUrl = key;
    const attachment = await prisma.maintenanceAttachment.create({ data: { requestId: threadId, fileUrl, fileType, fileName } });
    return res.status(200).json(attachment);
  } catch (e: any) {
    console.error('maintenance attachment create error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
