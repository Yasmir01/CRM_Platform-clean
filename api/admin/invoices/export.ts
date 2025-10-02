import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { ensurePermission } from '../../../src/lib/authorize';
import PDFDocument from 'pdfkit';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) return res.status(403).json({ error: 'Forbidden' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const format = String(body.format || 'csv').toLowerCase();
    const filters = (body.filters || {}) as { status?: string; vendorId?: string; dateFrom?: string; dateTo?: string; propertyId?: string };

    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.vendorId) where.vendorId = filters.vendorId;
    if (filters.dateFrom && filters.dateTo) where.uploadedAt = { gte: new Date(filters.dateFrom), lte: new Date(filters.dateTo) };

    // Restrict by org for ADMINs; SUPER_ADMIN sees all
    let requestFilter: any = {};
    if (filters.propertyId) requestFilter.propertyId = filters.propertyId;
    if (role !== 'SUPER_ADMIN') {
      const dbUser = await prisma.user.findUnique({ where: { id: String((user as any).sub || (user as any).id) } });
      if (dbUser?.orgId) requestFilter.orgId = dbUser.orgId;
    }
    if (Object.keys(requestFilter).length > 0) where.request = requestFilter;

    const invoices = await prisma.maintenanceInvoice.findMany({
      where,
      include: { vendor: true, request: { include: { property: true } }, files: true },
      orderBy: { uploadedAt: 'desc' },
      take: 2000,
    });

    if (format === 'csv') {
      const esc = (s: any) => {
        const str = s === null || s === undefined ? '' : String(s);
        return /[",\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;
      };
      const header = 'Invoice ID,Amount,Status,Vendor,Vendor Email,Property Address,Uploaded At,File Count\n';
      const rows = invoices
        .map((i) => `${esc(i.id)},${esc(i.amount ?? '')},${esc(i.status)},${esc(i.vendor?.name || '')},${esc(i.vendor?.email || '')},${esc(i.request?.property?.address || '')},${esc(new Date(i.uploadedAt).toISOString())},${esc(i.files.length)}`)
        .join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=invoices.csv');
      return res.status(200).send(header + rows);
    }

    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 30 });
      const chunks: Buffer[] = [];
      doc.on('data', (c: any) => chunks.push(Buffer.from(c)));
      const bufferPromise = new Promise<Buffer>((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));
      });

      doc.fontSize(18).text('Invoice Report', { align: 'center' });
      doc.moveDown();

      invoices.forEach((i) => {
        doc.fontSize(12).text(`Invoice ID: ${i.id}`);
        doc.text(`Vendor: ${i.vendor?.name || i.vendor?.email || 'N/A'}`);
        doc.text(`Property: ${i.request?.property?.address || 'N/A'}`);
        doc.text(`Amount: $${i.amount ?? ''}`);
        doc.text(`Status: ${i.status}`);
        doc.text(`Uploaded: ${new Date(i.uploadedAt).toLocaleString()}`);
        if (i.files.length > 0) doc.text(`Files: ${i.files.map((f) => f.fileName).join(', ')}`);
        doc.moveDown();
      });

      doc.end();
      const buffer = await bufferPromise;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=invoices.pdf');
      return res.status(200).send(buffer);
    }

    return res.status(400).json({ error: 'Invalid format' });
  } catch (e: any) {
    console.error('admin invoices export error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
