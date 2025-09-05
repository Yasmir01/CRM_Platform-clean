import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { getUserOr401 } from '../../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    const id = String((req.query as any)?.id || '').trim();
    if (!id) return res.status(400).json({ error: 'Missing id' });

    const userId = String((user as any).sub || (user as any).id);
    const updated = await prisma.directMessage.updateMany({ where: { id, receiverId: userId }, data: { isRead: true } });
    return res.status(200).json({ success: true, updated: updated.count });
  } catch (e: any) {
    console.error('mark read error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
