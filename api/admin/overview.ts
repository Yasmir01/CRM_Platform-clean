import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const userPayload = getUserOr401(req, res);
  if (!userPayload) return;

  const userId = String(userPayload.sub || userPayload?.id || '');
  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!dbUser) return res.status(401).json({ error: 'Unauthorized' });

  const allowed = ['SUPER_ADMIN', 'ADMIN', 'OWNER'];
  const role = String(dbUser.role || '').toUpperCase();
  if (!allowed.includes(role)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const payments = await prisma.payment.findMany({
      where: { createdAt: { gte: startOfYear } },
      include: { lease: { include: { property: true } }, tenant: true },
    });

    const leases = await prisma.lease.findMany({ where: { archived: false, status: 'ACTIVE' }, include: { tenant: true, property: true } });

    const totalCollected = payments
      .filter((p: any) => String(p.status || '').toUpperCase() === 'PAID' || String(p.status || '').toLowerCase() === 'succeeded' || String(p.status || '').toLowerCase() === 'success')
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    // overdue: leases with a dueDate in past and no PAID payment for that lease
    const overdue = leases.filter((l: any) => {
      if (!l.dueDate) return false;
      const due = new Date(l.dueDate);
      if (due >= today) return false;
      const paid = payments.find((p: any) => p.leaseId === l.id && (String(p.status || '').toUpperCase() === 'PAID' || String(p.status || '').toLowerCase() === 'succeeded' || String(p.status || '').toLowerCase() === 'success'));
      return !paid;
    });

    const totalOverdue = overdue.reduce((sum: number, l: any) => sum + (l.rentAmount || 0), 0);

    // monthly trend for last 6 months (oldest -> newest)
    const monthlyData: { month: string; collected: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      const collected = payments
        .filter((p: any) => {
          const created = new Date(p.createdAt);
          return (
            (String(p.status || '').toUpperCase() === 'PAID' || String(p.status || '').toLowerCase() === 'succeeded' || String(p.status || '').toLowerCase() === 'success') &&
            created.getMonth() === d.getMonth() &&
            created.getFullYear() === d.getFullYear()
          );
        })
        .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

      monthlyData.push({ month: monthLabel, collected });
    }

    return res.status(200).json({
      totals: {
        collected: totalCollected,
        overdue: totalOverdue,
        tenants: leases.length,
      },
      trend: monthlyData,
    });
  } catch (err: any) {
    console.error('admin overview error', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
