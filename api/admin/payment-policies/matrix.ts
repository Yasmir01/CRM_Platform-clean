import { prisma } from '../../_db';
import { ensurePermission } from '../../../src/lib/authorize';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (!['ADMIN','SUPER_ADMIN'].includes(role)) return res.status(403).json({ error: 'Forbidden' });

  try {
    const { leaseId } = req.query as { leaseId?: string };
    if (!leaseId) return res.status(400).json({ error: 'Lease ID required' });

    const lease = await prisma.lease.findUnique({
      where: { id: String(leaseId) },
      include: { unit: true },
    } as any);
    if (!lease) return res.status(404).json({ error: 'Lease not found' });

    const propertyId = lease.unit?.propertyId || null;

    const global = await prisma.propertyPaymentPolicy.findFirst({ where: { propertyId: null } });
    const property = propertyId ? await prisma.propertyPaymentPolicy.findUnique({ where: { propertyId } }) : null;

    const leasePolicy = {
      allowPartial: typeof (lease as any).allowPartial === 'boolean' ? Boolean((lease as any).allowPartial) : undefined,
      allowSplit: typeof (lease as any).allowSplit === 'boolean' ? Boolean((lease as any).allowSplit) : undefined,
      minPartialUsd: typeof (lease as any).minPartialUsd === 'number' ? Number((lease as any).minPartialUsd) : undefined,
    } as { allowPartial?: boolean; allowSplit?: boolean; minPartialUsd?: number };

    const effective = {
      allowPartial: typeof leasePolicy.allowPartial === 'boolean' ? leasePolicy.allowPartial : (property?.allowPartial ?? global?.allowPartial ?? true),
      allowSplit: typeof leasePolicy.allowSplit === 'boolean' ? leasePolicy.allowSplit : (property?.allowSplit ?? global?.allowSplit ?? true),
      minPartialUsd: typeof leasePolicy.minPartialUsd === 'number' ? leasePolicy.minPartialUsd : (property?.minPartialUsd ?? global?.minPartialUsd ?? 10),
    };

    const rows: any[] = [];
    if (global) rows.push({ level: 'GLOBAL', allowPartial: global.allowPartial, allowSplit: global.allowSplit, minPartialUsd: global.minPartialUsd });
    if (property) rows.push({ level: 'PROPERTY', allowPartial: property.allowPartial, allowSplit: property.allowSplit, minPartialUsd: property.minPartialUsd });
    if (leasePolicy.allowPartial !== undefined || leasePolicy.allowSplit !== undefined || leasePolicy.minPartialUsd !== undefined) {
      rows.push({ level: 'LEASE', allowPartial: leasePolicy.allowPartial ?? effective.allowPartial, allowSplit: leasePolicy.allowSplit ?? effective.allowSplit, minPartialUsd: leasePolicy.minPartialUsd ?? effective.minPartialUsd });
    }
    rows.push({ level: 'EFFECTIVE', ...effective });

    return res.status(200).json(rows);
  } catch (e: any) {
    console.error('payment-policies/matrix GET error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
