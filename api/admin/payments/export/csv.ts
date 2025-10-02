import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../../_db';
import { ensurePermission } from '../../../../src/lib/authorize';

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
      take: 500,
    });

    const esc = (s: any) => {
      const str = s === null || s === undefined ? '' : String(s);
      return /[",\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;
    };

    const header = 'Tenant,Amount,Status,Type,Date,Refund Reason\n';
    const rows = payments
      .map((p) => `${esc(p.tenant?.name || p.tenant?.email || 'N/A')},${esc(p.amount)},${esc(p.status)},${esc(p.autopay ? 'AutoPay' : 'One-Time')},${esc(new Date(p.createdAt).toLocaleString())},${esc(p.refundReason || '')}`)
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=payments.csv');
    return res.status(200).send(header + rows);
  } catch (e: any) {
    console.error('admin payments export csv error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
