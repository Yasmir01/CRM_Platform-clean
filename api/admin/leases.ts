import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../src/utils/authz';
import { prisma } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    if (req.method === 'GET') {
      const leases = await prisma.lease.findMany({ include: { property: true, tenant: true }, orderBy: { startDate: 'desc' } });
      return res.status(200).json(leases);
    }

    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e: any) {
    console.error('admin/leases error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
