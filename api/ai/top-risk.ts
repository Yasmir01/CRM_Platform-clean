import { defineHandler } from '../_handler';
import { prisma } from '../_db';
import { z } from 'zod';

const Body = z.object({
  orgId: z.string(),
  windowDays: z.number().min(1).max(365).default(90).optional(),
  limit: z.number().min(1).max(50).default(5).optional(),
});

export default defineHandler({
  methods: ['POST'],
  roles: ['ADMIN', 'SUPER_ADMIN', 'OWNER'],
  bodySchema: Body,
  limitKey: 'ai:top-risk',
  fn: async ({ res, body }) => {
    const orgId = body.orgId;
    const windowDays = body.windowDays ?? 90;
    const limit = body.limit ?? 5;

    const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

    const leases = await prisma.lease.findMany({
      where: { orgId },
      select: {
        tenantId: true,
        tenant: { select: { id: true, name: true } },
        payments: {
          where: { createdAt: { gte: since } },
          select: { status: true, amount: true, createdAt: true },
        },
      },
    } as any);

    const byTenant = new Map<string, { id: string; name: string; total: number; late: number }>();

    for (const l of leases) {
      const id = (l as any).tenant?.id as string | undefined;
      const name = (l as any).tenant?.name || 'Tenant';
      if (!id) continue;

      const agg = byTenant.get(id) || { id, name, total: 0, late: 0 };
      const payments = (l as any).payments as Array<{ status: string }> | undefined;
      if (payments && payments.length) {
        for (const p of payments) {
          agg.total += 1;
          if (String(p.status).toLowerCase() !== 'success') agg.late += 1;
        }
      }
      byTenant.set(id, agg);
    }

    if (byTenant.size === 0) return res.status(200).json({ tenants: [] });

    const scored = Array.from(byTenant.values()).map((t) => {
      const onTimeRate = t.total > 0 ? (t.total - t.late) / t.total : 1;
      let score = Math.round(100 * onTimeRate);
      if (t.late >= 3) score = Math.max(0, score - 30);
      return { id: t.id, name: t.name, score };
    });

    scored.sort((a, b) => a.score - b.score);
    const top = scored.slice(0, limit);

    return res.status(200).json({ tenants: top });
  },
});
