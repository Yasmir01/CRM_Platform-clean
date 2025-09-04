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
    const records: any[] = Array.isArray(body.records) ? body.records : [];

    const doc = new PDFDocument({ margin: 30 });
    const chunks: Buffer[] = [];
    doc.on('data', (c: any) => chunks.push(Buffer.from(c)));
    const bufferPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));
    });

    doc.fontSize(18).text('Payment Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text('Tenant | Property | Lease | Amount | Status | Date');
    doc.moveDown(0.5);

    records.forEach((r) => {
      const line = [
        r.tenantName || '',
        r.propertyName || '',
        r.leaseName || '',
        `$${Number(r.amount || 0).toFixed(2)}`,
        r.status || '',
        (r.date ? new Date(r.date).toLocaleDateString() : '')
      ].join(' | ');
      doc.text(line);
    });

    doc.end();
    const buffer = await bufferPromise;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=payment_report.pdf');
    return res.status(200).send(buffer);
  } catch (e: any) {
    console.error('admin/payments export-pdf error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
