import type { VercelResponse } from '@vercel/node';
import { defineHandler } from '../_handler';
import { prisma } from '../_db';

export default defineHandler({
  methods: ['GET'],
  roles: ['ADMIN', 'SUPER_ADMIN', 'MANAGER'],
  limitKey: 'reports:rent-roll',
  fn: async ({ req, res }) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const orgId = String(url.searchParams.get('orgId') || '');

    // Fetch active or current leases with related unit and tenant
    const leases = await prisma.lease.findMany({
      where: orgId ? { orgId } : {},
      include: { unit: true, tenant: true },
      orderBy: { updatedAt: 'desc' },
      take: 1000,
    } as any);

    const rows = leases.map((l: any) => ({
      id: l.id,
      unit: l.unit?.number || '—',
      tenant: l.tenant?.name || '—',
      rent: typeof l.rentAmount === 'number' ? `$${Number(l.rentAmount).toFixed(2)}` : '—',
      status: l.status || '—',
    }));

    return (res as VercelResponse).json({ rows, total: rows.length });
  },
});
