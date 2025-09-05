import { prisma } from '../_db';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const { leaseId, tenantId } = req.query as { leaseId?: string; tenantId?: string };
    if (!leaseId || !tenantId) return res.status(400).json({ error: 'leaseId and tenantId required' });

    const lease = await prisma.lease.findUnique({ where: { id: String(leaseId) }, include: { unit: true } } as any);
    if (!lease) return res.status(404).json({ error: 'Lease not found' });
    const propertyId = lease.unit?.propertyId || null;

    const ap = await prisma.autoPay.findFirst({ where: { tenantId: String(tenantId), propertyId: propertyId || undefined, active: true } });
    return res.status(200).json(ap);
  } catch (e: any) {
    console.error('tenant/autopay GET error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
