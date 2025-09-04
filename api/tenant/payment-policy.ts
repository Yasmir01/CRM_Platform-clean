import { prisma } from '../_db';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const { leaseId } = req.query as { leaseId?: string };
    if (!leaseId) return res.status(400).json({ error: 'leaseId required' });

    const lease = await prisma.lease.findUnique({ where: { id: String(leaseId) }, include: { unit: true } } as any);
    if (!lease) return res.status(404).json({ error: 'Lease not found' });
    const propertyId = lease.unit?.propertyId || null;

    const global = await prisma.propertyPaymentPolicy.findFirst({ where: { propertyId: null } });
    const property = propertyId ? await prisma.propertyPaymentPolicy.findUnique({ where: { propertyId } }) : null;

    const effective = {
      allowPartial: typeof (lease as any).allowPartial === 'boolean' ? Boolean((lease as any).allowPartial) : (property?.allowPartial ?? global?.allowPartial ?? true),
      allowSplit: typeof (lease as any).allowSplit === 'boolean' ? Boolean((lease as any).allowSplit) : (property?.allowSplit ?? global?.allowSplit ?? true),
      minPartialUsd: typeof (lease as any).minPartialUsd === 'number' ? Number((lease as any).minPartialUsd) : (property?.minPartialUsd ?? global?.minPartialUsd ?? 10),
    };

    return res.status(200).json(effective);
  } catch (e: any) {
    console.error('tenant/payment-policy GET error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
