import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = getUserOr401(req, res);
  if (!user) return;

  const role = String((user as any).role || '').toUpperCase();
  if (!['ADMIN','SUPER_ADMIN'].includes(role)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const requestId = String(body.requestId || '').trim();
    const vendorId = body.vendorId ? String(body.vendorId) : null;
    if (!requestId) return res.status(400).json({ error: 'Missing requestId' });

    const updated = await prisma.maintenanceRequest.update({ where: { id: requestId }, data: { vendorId } });
    return res.status(200).json({ success: true, updated });
  } catch (e: any) {
    console.error('maintenance vendor error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
