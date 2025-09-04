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
    const autopays: any[] = Array.isArray(body.autopays) ? body.autopays : [];

    const doc = new PDFDocument({ margin: 32, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on('data', (c: any) => chunks.push(Buffer.from(c)));
    const bufferPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));
    });

    doc.fontSize(18).text('Autopay Report', { align: 'center' });
    doc.moveDown();

    const headers = ['Tenant', 'Property', 'Lease', 'Amount', 'Frequency', 'Split With', 'Status'];
    doc.fontSize(12).text(headers.join(' | '));
    doc.moveDown(0.5);

    autopays.forEach((a) => {
      const tenant = a.tenantName || a.tenant?.name || a.tenant?.email || a.tenantId || '';
      const property = a.propertyName || a.property?.address || a.propertyId || '';
      const lease = a.leaseName || (a.lease?.unit?.number ? String(a.lease.unit.number) : a.leaseId || '');
      const amount = typeof a.amount === 'number' ? a.amount : (typeof a.amountValue === 'number' ? a.amountValue : 0);
      const frequency = a.frequency || 'monthly';
      const split = Array.isArray(a.splitEmails) && a.splitEmails.length ? a.splitEmails.join(', ') : '—';
      const status = a.active ? 'Active' : 'Suspended';
      const line = [tenant, property, lease, `$${Number(amount).toFixed(2)}`, frequency, split, status].join(' | ');
      doc.text(line);
    });

    doc.end();
    const buffer = await bufferPromise;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=autopay_report.pdf');
    return res.status(200).send(buffer);
  } catch (e: any) {
    console.error('admin/autopay export pdf error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
