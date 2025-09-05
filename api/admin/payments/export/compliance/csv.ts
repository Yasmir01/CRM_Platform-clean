import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../../../_db';
import { ensurePermission } from '../../../../../src/lib/authorize';

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
    const month = Number(req.query?.month || new Date().getMonth() + 1); // 1-12
    const year = Number(req.query?.year || new Date().getFullYear());
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const payments = await prisma.rentPayment.findMany({
      where: { createdAt: { gte: start, lt: end } },
      include: { tenant: true },
      orderBy: { createdAt: 'desc' },
    });

    const esc = (s: any) => {
      const str = s === null || s === undefined ? '' : String(s);
      return /[",\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;
    };

    const header = 'Date,Tenant,Amount,Gateway,Status\n';
    const rows = payments
      .map((p) => [
        new Date(p.createdAt).toISOString(),
        p.tenant?.name || p.tenant?.email || 'N/A',
        `$${Number(p.amount).toFixed(2)}`,
        p.gateway,
        p.status,
      ].map(esc).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=payments_compliance_${year}-${String(month).padStart(2,'0')}.csv`);
    return res.status(200).send(header + rows);
  } catch (e: any) {
    console.error('compliance export csv error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
