import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../src/utils/authz';
import { prisma } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    const q = (req.query || {}) as any;
    const propertyId = q.propertyId ? String(q.propertyId) : undefined;
    const where: any = {};
    if (propertyId) where.propertyId = propertyId;

    const leases = await prisma.lease.findMany({ where, orderBy: { startDate: 'desc' } });
    return res.status(200).json(leases);
  } catch (e: any) {
    console.error('leases/list error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
