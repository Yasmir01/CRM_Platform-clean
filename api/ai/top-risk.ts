import { defineHandler } from '../_handler';
import { prisma } from '../_db';

export default defineHandler({
  methods: ['GET'],
  roles: ['ADMIN', 'SUPER_ADMIN', 'MANAGER'],
  limitKey: 'ai:top-risk',
  fn: async ({ req, res }) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const orgId = String(url.searchParams.get('orgId') || '');
    if (!orgId) return res.status(400).json({ error: 'orgId_required' });

    const leases = await prisma.lease.findMany({
      where: { orgId },
      select: { tenantId: true, tenant: { select: { id: true, name: true } } },
    } as any);

    const map = new Map<string, { id: string; name: string }>();
    for (const l of leases) {
      const id = (l as any).tenantId as string;
      const name = (l as any).tenant?.name || 'Tenant';
      if (id) map.set(id, { id, name });
    }

    const tenantIds = Array.from(map.keys());
    if (tenantIds.length === 0) return res.status(200).json({ tenants: [] });

    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const payments = await prisma.rentPayment.findMany({
      where: { tenantId: { in: tenantIds }, createdAt: { gte: since } },
      select: { tenantId: true, status: true, amount: true, createdAt: true },
    });

    const stats = new Map<string, { total: number; late: number }>();
    for (const p of payments) {
      const key = p.tenantId as string;
      const s = stats.get(key) || { total: 0, late: 0 };
      s.total += 1;
      if (String(p.status).toLowerCase() !== 'success') s.late += 1;
      stats.set(key, s);
    }

    const scored = tenantIds.map((id) => {
      const s = stats.get(id) || { total: 0, late: 0 };
      const onTimeRate = s.total > 0 ? (s.total - s.late) / s.total : 1;
      let score = Math.round(100 * onTimeRate);
      if (s.late >= 3) score = Math.max(0, score - 30);
      return { id, name: map.get(id)?.name || 'Tenant', score };
    });

    scored.sort((a, b) => a.score - b.score);
    const top = scored.slice(0, 10);

    return res.status(200).json({ tenants: top });
  },
});
