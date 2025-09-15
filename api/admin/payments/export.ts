import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { getUserOr401 } from '../../../src/utils/authz';
import { Parser } from 'json2csv';
import jsPDF from 'jspdf';

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
    const format = String((req.query && (req.query as any).format) || 'csv');

    const payments = await prisma.rentPayment.findMany({ orderBy: { createdAt: 'desc' }, include: { tenant: true, lease: { include: { unit: { include: { property: true } }, property: true } } } });

    if (format === 'csv') {
      const data = payments.map((p: any) => ({ Tenant: p.tenant?.name || '', Property: (p.lease?.unit?.property?.title || p.lease?.property?.title || ''), Amount: p.amount, Date: new Date(p.createdAt).toLocaleDateString(), Status: p.status }));
      const parser = new Parser({ fields: ['Tenant', 'Property', 'Amount', 'Date', 'Status'] });
      const csv = parser.parse(data as any);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="payments.csv"');
      return res.status(200).send(csv);
    }

    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text('Tenant Payments Report', 14, 20);
      let y = 40;
      payments.forEach((p: any, i: number) => {
        const line = `${i + 1}. ${p.tenant?.name || ''} - ${p.lease?.property?.title || (p.lease?.unit?.property?.title || '')} - $${p.amount} - ${new Date(p.createdAt).toLocaleDateString()} - ${p.status}`;
        doc.text(line, 14, y);
        y += 8;
        if (y > 270) { doc.addPage(); y = 20; }
      });
      const pdf = doc.output('arraybuffer');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="payments.pdf"');
      return res.status(200).send(Buffer.from(pdf));
    }

    return res.status(400).json({ error: 'Invalid format' });
  } catch (err: any) {
    console.error('admin payments export error', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
