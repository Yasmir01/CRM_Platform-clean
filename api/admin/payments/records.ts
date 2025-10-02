import { prisma } from '../../_db';
import { ensurePermission } from '../../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) return res.status(403).json({ error: 'Forbidden' });

  try {
    const propertyId = typeof req.query?.property === 'string' ? String(req.query.property) : '';
    const leaseId = typeof req.query?.lease === 'string' ? String(req.query.lease) : '';
    const tenantQ = typeof req.query?.tenant === 'string' ? String(req.query.tenant).trim().toLowerCase() : '';

    const where: any = {};
    if (propertyId) where.propertyId = propertyId;
    if (leaseId) where.leaseId = leaseId;

    const list = await prisma.rentPayment.findMany({
      where,
      include: { tenant: true, property: true, lease: { include: { unit: true } } },
      orderBy: { createdAt: 'desc' },
      take: 500,
    } as any);

    const filtered = tenantQ
      ? list.filter((p: any) => {
          const name = p.tenant?.name || p.tenant?.email || p.tenantId || '';
          return String(name).toLowerCase().includes(tenantQ);
        })
      : list;

    const items = filtered.map((p: any) => {
      const statusRaw = String(p.status || '').toLowerCase();
      const status = (statusRaw === 'success' || statusRaw === 'completed') ? 'paid' : 'outstanding';
      const tenantName = p.tenant?.name || p.tenant?.email || p.tenantId;
      const propertyName = p.property?.address || p.propertyId || '-';
      const leaseName = p.lease?.unit ? String(p.lease.unit.number) : (p.leaseId || '-');
      return {
        id: p.id,
        tenantName,
        propertyId: p.propertyId || '',
        propertyName,
        leaseId: p.leaseId || '',
        leaseName,
        amount: Number(p.amount || 0),
        status,
        date: new Date(p.createdAt).toISOString(),
      };
    });

    return res.status(200).json(items);
  } catch (e: any) {
    console.error('admin/payments/records error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
