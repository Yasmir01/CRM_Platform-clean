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
  if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) return res.status(403).json({ error: 'Forbidden' });

  try {
    const payments = await prisma.rentPayment.findMany({
      include: { tenant: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return res.status(200).json(payments);
  } catch (e: any) {
    console.error('admin/payments error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
