import { prisma } from '../_db';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const { leaseId, tenantId } = req.query as { leaseId?: string; tenantId?: string };
    if (!leaseId || !tenantId) return res.status(400).json({ error: 'leaseId and tenantId required' });

    const invoices = await prisma.invoice.findMany({ where: { leaseId: String(leaseId), status: { in: ['OPEN', 'PARTIALLY_PAID'] } }, include: { lines: true } });
    let totalDue = 0;
    for (const inv of invoices) {
      const billed = inv.lines.filter((l: any) => l.billToTenantId === tenantId).reduce((s: number, l: any) => s + Number(l.amount || 0), 0);
      if (billed <= 0) continue;
      const alloc = await prisma.paymentAllocation.aggregate({ _sum: { amount: true }, where: { invoiceId: inv.id, tenantId: String(tenantId) } });
      totalDue += Math.max(0, billed - Number(alloc._sum.amount ?? 0));
    }
    return res.status(200).json({ amountDue: Number(totalDue.toFixed(2)) });
  } catch (e: any) {
    console.error('tenant/balance GET error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
