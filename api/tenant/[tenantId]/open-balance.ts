import { prisma } from '../../_db';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { tenantId } = req.query as { tenantId: string };
    if (!tenantId) return res.status(400).json({ error: 'Missing tenantId' });

    const invoices = await prisma.invoice.findMany({ where: { status: { in: ['OPEN', 'PARTIALLY_PAID'] } }, include: { lines: true } });

    let totalDue = 0;

    for (const inv of invoices) {
      const alloc = await prisma.paymentAllocation.aggregate({ _sum: { amount: true }, where: { invoiceId: inv.id, tenantId } });
      const billed = inv.lines.filter((l: any) => l.billToTenantId === tenantId).reduce((s: number, l: any) => s + Number(l.amount || 0), 0);
      const billedDue = billed - Number(alloc._sum.amount ?? 0);
      totalDue += Math.max(0, billedDue);
    }

    return res.status(200).json({ tenantId, totalDue: Number(totalDue.toFixed(2)) });
  } catch (e: any) {
    console.error('tenant/[tenantId]/open-balance GET error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
