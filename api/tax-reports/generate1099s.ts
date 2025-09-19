import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../src/utils/authz';
import { prisma } from '../_db';
import { safeParse } from '../../src/utils/safeJson';
import { Parser } from 'json2csv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;
  // Only admins or super admins
  const role = String((user as any).role || '').toLowerCase();
  if (!role.includes('super') && !role.includes('admin')) return res.status(403).json({ error: 'forbidden' });

  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const body = typeof req.body === 'string' ? safeParse(req.body, {}) : (req.body || {});
    const year = Number.isFinite(body.year) ? Number(body.year) : new Date().getFullYear();
    const threshold = Number.isFinite(body.threshold) ? Number(body.threshold) : 600;

    // Sum vendor payouts from maintenanceInvoice for the year
    const start = new Date(`${year}-01-01T00:00:00.000Z`);
    const end = new Date(`${year + 1}-01-01T00:00:00.000Z`);

    const invoices = await prisma.maintenanceInvoice.findMany({ where: { createdAt: { gte: start, lt: end }, vendorId: { not: null }, status: { in: ['approved', 'paid', 'completed'] } }, select: { vendorId: true, amount: true } });

    const totalsByVendor: Record<string, number> = {};
    for (const inv of invoices) {
      const v = String(inv.vendorId);
      totalsByVendor[v] = (totalsByVendor[v] || 0) + Number(inv.amount || 0);
    }

    const createdReports: any[] = [];

    for (const [vendorId, total] of Object.entries(totalsByVendor)) {
      if (total >= threshold) {
        // create CSV content for 1099 (simple stub)
        const rows = [{ vendorId, total }];
        const csv = new Parser({ fields: ['vendorId', 'total'] }).parse(rows);
        // In production: upload CSV to S3 and set fileUrl
        const fileUrl = (process.env.ASSET_BASE_URL || 'https://storage.example.com') + `/tax_reports/1099-${vendorId}-${year}.csv`;

        const landlordId = String((user as any).sub || (user as any).id);
        const tr = await prisma.taxReport.create({ data: { landlordId, vendorId, year, type: '1099', fileUrl } as any });
        createdReports.push({ vendorId, total, taxReportId: tr.id, fileUrl, csv });
      }
    }

    return res.status(200).json({ success: true, created: createdReports.length, reports: createdReports });
  } catch (e: any) {
    console.error('tax-reports/generate1099s error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
