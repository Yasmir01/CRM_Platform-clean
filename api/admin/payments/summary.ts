import { prisma } from '../../_db';
import { ensurePermission } from '../../../src/lib/authorize';

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(d: Date) {
  return d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

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

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const ledgerWhere: any = { date: { gte: start }, type: 'RENT' };
    if (leaseId) ledgerWhere.leaseId = leaseId;
    if (propertyId && !leaseId) ledgerWhere.lease = { unit: { propertyId } };

    const paymentWhere: any = { createdAt: { gte: start } };
    if (propertyId) paymentWhere.propertyId = propertyId;
    if (leaseId) paymentWhere.leaseId = leaseId;

    const [charges, payments] = await Promise.all([
      prisma.ledgerEntry.findMany({ where: ledgerWhere, include: { lease: { include: { tenant: true, unit: true } } } } as any),
      prisma.rentPayment.findMany({ where: paymentWhere, include: { tenant: true } })
    ]);

    const filteredCharges = tenantQ
      ? charges.filter((c: any) => {
          const name = c.lease?.tenant?.name || '';
          return name.toLowerCase().includes(tenantQ);
        })
      : charges;

    const filteredPayments = tenantQ
      ? payments.filter((p: any) => {
          const name = p.tenant?.name || p.tenant?.email || '';
          return name.toLowerCase().includes(tenantQ);
        })
      : payments;

    // Initialize last 12 months buckets
    const buckets: Record<string, { month: string; collected: number; outstanding: number }> = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthKey(d);
      buckets[key] = { month: monthLabel(d), collected: 0, outstanding: 0 };
    }

    // Sum charges (rent) per month
    for (const c of filteredCharges) {
      const k = monthKey(new Date(c.date));
      if (!buckets[k]) continue;
      buckets[k].outstanding += (c.amountCents || 0) / 100;
    }

    // Sum collected (successful) per month
    for (const p of filteredPayments) {
      const k = monthKey(new Date(p.createdAt));
      if (!buckets[k]) continue;
      const ok = String(p.status || '').toLowerCase();
      if (ok === 'success' || ok === 'completed') buckets[k].collected += Number(p.amount || 0);
    }

    // Compute outstanding = max(0, charges - collected)
    const result = Object.values(buckets).map((b) => ({
      month: b.month,
      collected: Number(b.collected.toFixed(2)),
      outstanding: Number(Math.max(0, b.outstanding - b.collected).toFixed(2))
    }));

    return res.status(200).json(result);
  } catch (e: any) {
    console.error('admin/payments/summary error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
