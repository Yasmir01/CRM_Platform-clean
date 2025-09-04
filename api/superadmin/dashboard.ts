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
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [subscribers, tenants, rentVolumeAgg, failedRate] = await Promise.all([
      prisma.subscriber.count(),
      prisma.tenant.count(),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { createdAt: { gte: startOfMonth } } }),
      prisma.payment.count({ where: { status: 'failed' } }),
    ]);

    return res.status(200).json({
      subscribers,
      tenants,
      rentVolume: rentVolumeAgg._sum.amount || 0,
      failedRate,
    });
  } catch (e: any) {
    console.error('superadmin/dashboard error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
