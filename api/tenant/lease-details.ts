import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Method Not Allowed' }); }
  const auth = getUserOr401(req, res); if (!auth) return;
  const userId = String((auth as any).sub || (auth as any).id);

  const today = new Date();
  const lease = await prisma.lease.findFirst({ where: { tenantId: userId, startDate: { lte: today }, OR: [{ endDate: null }, { endDate: { gte: today } }] } });
  if (!lease) return res.status(200).json({ lease: null, documents: [] });

  const documents = await prisma.document.findMany({ where: { leaseId: lease.id }, orderBy: { createdAt: 'desc' } });
  return res.status(200).json({ lease, documents });
}
