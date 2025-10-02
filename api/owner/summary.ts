import type { VercelRequest, VercelResponse } from '@vercel/node';
import { defineHandler } from '../_handler';
import { prisma } from '../_db';

export default defineHandler({
  methods: ['GET'],
  roles: ['OWNER', 'ADMIN', 'SUPER_ADMIN'],
  limitKey: 'owner:summary',
  fn: async ({ req, res, user }) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const ownerId = String(url.searchParams.get('ownerId') || '');
    if (!ownerId) return res.status(400).json({ error: 'ownerId_required' });

    const roles = Array.isArray((user as any).roles) ? (user as any).roles.map((r: string) => String(r).toLowerCase()) : [];
    const role = (user as any).role ? String((user as any).role).toLowerCase() : '';
    const isAdmin = roles.includes('admin') || roles.includes('superadmin') || role === 'admin' || role === 'super_admin';
    if (!isAdmin && String((user as any).sub || (user as any).id) !== ownerId) {
      return res.status(403).json({ error: 'forbidden' });
    }

    const rentAgg = await prisma.ownerLedger.aggregate({ _sum: { amount: true }, where: { ownerId, entryType: 'rent_income' } });
    const expAgg = await prisma.ownerLedger.aggregate({ _sum: { amount: true }, where: { ownerId, entryType: 'expense' } });

    const rentCollected = Number(rentAgg._sum.amount ?? 0);
    const expenses = Number(expAgg._sum.amount ?? 0);

    return (res as VercelResponse).json({ rentCollected, expenses });
  },
});
