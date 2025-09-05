import type { VercelResponse } from '@vercel/node';
import { defineHandler } from '../_handler';
import { prisma } from '../_db';
import { z } from 'zod';

const Body = z.object({ tenantId: z.string() });

export default defineHandler({
  methods: ['GET', 'POST'],
  // Method-specific checks handled inside fn for flexibility
  limitKey: 'ai:rent-risk',
  bodySchema: Body,
  fn: async ({ req, res, user, body }) => {
    if (req.method === 'POST') {
      // Admin-only POST scoring per spec
      const roles = Array.isArray((user as any).roles) ? (user as any).roles.map((r: string) => String(r).toUpperCase()) : [];
      const role = (user as any).role ? String((user as any).role).toUpperCase() : '';
      const isAdmin = roles.includes('ADMIN') || roles.includes('SUPERADMIN') || role === 'ADMIN' || role === 'SUPER_ADMIN';
      if (!isAdmin) return res.status(403).json({ error: 'forbidden' });

      const tenantId = String((body as any).tenantId || '');
      if (!tenantId) return res.status(400).json({ error: 'tenantId_required' });

      const payments = await prisma.rentPayment.findMany({ where: { tenantId } });
      const total = payments.length;
      const latePayments = payments.filter((p) => String(p.status).toLowerCase() !== 'success').length;
      const onTimeRate = total > 0 ? (total - latePayments) / total : 1;

      let score = 100 * onTimeRate;
      if (latePayments >= 3) score -= 30;
      score = Math.max(0, Math.min(100, Math.round(score)));

      return res.json({ tenantId, score });
    }

    // GET heuristic for widgets (tenant or privileged roles)
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const tenantId = String(url.searchParams.get('tenantId') || '');
    if (!tenantId) return res.status(400).json({ error: 'tenantId_required' });

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

    let score = 40;
    if (outstanding > 0) score += Math.min(35, Math.ceil(outstanding / 100));
    if (daysSincePay > 45) score += 20;
    if (paidSum < 200) score += 10;
    if (paidSum > 500) score -= 10;
    if (outstanding === 0 && daysSincePay <= 30) score -= 15;

    score = Math.max(0, Math.min(100, Math.round(score)));

    return (res as VercelResponse).json({ score, outstanding, recentPaid: paidSum, daysSincePay });
  },
});
