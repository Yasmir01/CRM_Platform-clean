import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { ensurePermission } from '../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });

  try {
    const now = new Date();
    const months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return { label: d.toLocaleString('default', { month: 'short' }), start: d };
    }).reverse();

    const rentData = await Promise.all(
      months.map(async (m, idx) => {
        const end = idx + 1 < months.length ? months[idx + 1].start : now;
        const total = await prisma.payment.aggregate({
          _sum: { amount: true },
          where: { createdAt: { gte: m.start, lt: end }, status: 'success' },
        });
        return { month: m.label, rent: total._sum.amount || 0 };
      })
    );

    const [totalPayments, failedPayments] = await Promise.all([
      prisma.payment.count(),
      prisma.payment.count({ where: { status: 'failed' } }),
    ]);
    const delinquencyRate = totalPayments ? (failedPayments / totalPayments) * 100 : 0;

    return res.status(200).json({ rentData, delinquencyRate });
  } catch (e: any) {
    console.error('superadmin/analytics error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
