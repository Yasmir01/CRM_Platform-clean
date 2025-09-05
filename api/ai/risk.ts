import type { VercelResponse } from '@vercel/node';
import { defineHandler } from '../_handler';
import { prisma } from '../_db';

export default defineHandler({
  methods: ['GET'],
  roles: ['TENANT', 'ADMIN', 'MANAGER', 'SUPER_ADMIN'],
  limitKey: 'ai:rent-risk',
  fn: async ({ req, res, user }) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const tenantId = String(url.searchParams.get('tenantId') || '');
    if (!tenantId) return res.status(400).json({ error: 'tenantId_required' });

    // Ensure same-tenant access unless privileged
    const roles = Array.isArray((user as any).roles) ? (user as any).roles.map((r: string) => String(r).toLowerCase()) : [];
    const role = (user as any).role ? String((user as any).role).toLowerCase() : '';
    const isPriv = roles.some((r) => ['admin', 'superadmin', 'manager'].includes(r)) || ['admin', 'super_admin'].includes(role);
    if (!isPriv && String((user as any).sub || (user as any).id) !== tenantId) {
      return res.status(403).json({ error: 'forbidden' });
    }

    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const recentPayments = await prisma.rentPayment.findMany({
      where: { tenantId, createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Compute outstanding due for this tenant across open/partial invoices
    const leases = await prisma.lease.findMany({ where: { tenantId }, select: { id: true } });
    const leaseIds = leases.map((l) => l.id);

    let outstanding = 0;
    if (leaseIds.length) {
      const invs = await prisma.invoice.findMany({
        where: { leaseId: { in: leaseIds }, status: { in: ['OPEN', 'PARTIALLY_PAID'] } },
        include: { lines: true },
      } as any);
      for (const inv of invs) {
        const billed = inv.lines
          .filter((l: any) => l.billToTenantId === tenantId)
          .reduce((s: number, l: any) => s + Number(l.amount || 0), 0);
        if (billed > 0) {
          const alloc = await prisma.paymentAllocation.aggregate({ _sum: { amount: true }, where: { invoiceId: inv.id, tenantId } });
          outstanding += Math.max(0, billed - Number(alloc._sum.amount ?? 0));
        }
      }
    }

    const paidSum = recentPayments.reduce((s, p) => s + Number(p.amount || 0), 0);
    const lastPaidAt = recentPayments[0]?.createdAt ? new Date(recentPayments[0].createdAt).getTime() : 0;
    const daysSincePay = lastPaidAt ? Math.floor((Date.now() - lastPaidAt) / (24 * 60 * 60 * 1000)) : 999;

    // Heuristic scoring 0..100 (higher = riskier)
    let score = 40;
    if (outstanding > 0) score += Math.min(35, Math.ceil(outstanding / 100)); // more due => higher risk
    if (daysSincePay > 45) score += 20;
    if (paidSum < 200) score += 10;
    if (paidSum > 500) score -= 10;
    if (outstanding === 0 && daysSincePay <= 30) score -= 15;

    score = Math.max(0, Math.min(100, Math.round(score)));

    return (res as VercelResponse).json({ score, outstanding, recentPaid: paidSum, daysSincePay });
  },
});
