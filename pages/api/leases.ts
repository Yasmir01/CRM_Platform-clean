import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_db';
import { getUserOr401 } from '../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const user = getUserOr401(req, res);
    if (!user) return;

    if (req.method === 'GET') {
      const take = Math.min(1000, Number((req.query as any).take || 100));
      const leases = await prisma.lease.findMany({ include: { property: true, tenant: true }, take, orderBy: { startDate: 'desc' } });
      return res.status(200).json(leases);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const propertyId = String(body.propertyId || '');
      const tenantId = String(body.tenantId || '');
      const startDate = body.startDate ? new Date(body.startDate) : null;
      const endDate = body.endDate ? new Date(body.endDate) : null;
      const rentAmount = Number(body.rentAmount || 0);

      if (!propertyId || !tenantId || !startDate || !endDate || !rentAmount) {
        return res.status(400).json({ error: 'Missing required lease fields' });
      }

      const lease = await prisma.lease.create({
        data: {
          propertyId,
          tenantId,
          startDate,
          endDate,
          rentAmount,
        },
      });

      return res.status(201).json(lease);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).end('Method Not Allowed');
  } catch (e: any) {
    console.error('leases handler error', e?.message || e);
    return res.status(500).json({ error: 'Server error' });
  }
}
