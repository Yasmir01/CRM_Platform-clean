import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userPayload = getUserOr401(req, res);
  if (!userPayload) return;

  const userId = String(userPayload.sub || userPayload?.id || '');
  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!dbUser) return res.status(401).json({ error: 'Unauthorized' });

  const allowed = ['SUPER_ADMIN', 'ADMIN', 'OWNER'];
  const role = String(dbUser.role || '').toUpperCase();
  if (!allowed.includes(role)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const format = (req.query && (req.query as any).format) ? String((req.query as any).format) : 'csv';

    const today = new Date();
    const payments = await prisma.payment.findMany({ orderBy: { createdAt: 'desc' }, include: { tenant: true, lease: { include: { property: true } } } });
    const leases = await prisma.lease.findMany({ where: { active: true }, include: { tenant: true, property: true } });
    const properties = await prisma.property.findMany({ include: { leases: true } });

    if (format === 'csv') {
      const { Parser } = await import('json2csv');
      const fields = ['Tenant', 'Property', 'Amount', 'Date', 'Status'];
      const data = payments.map((p: any) => ({ Tenant: p.tenant?.name || '', Property: p.lease?.property?.title || '', Amount: p.amount, Date: new Date(p.createdAt).toLocaleDateString(), Status: p.status }));
      const parser = new Parser({ fields });
      let csv = parser.parse(data as any);

      // Append property breakdown
      csv += '\n\nProperty,Collected,Overdue,Tenants\n';
      for (const prop of properties) {
        const propCollected = payments.filter((p: any) => p.lease && p.lease.propertyId === prop.id && String(p.status || '').toUpperCase() === 'PAID').reduce((s: number, p: any) => s + (p.amount || 0), 0);
        const propOverdue = leases.filter((l: any) => l.propertyId === prop.id && l.dueDate && new Date(l.dueDate) < today && !payments.find((p: any) => p.leaseId === l.id && String(p.status || '').toUpperCase() === 'PAID')).reduce((s: number, l: any) => s + (l.rentAmount || 0), 0);
        const tenantsCount = (prop.leases || []).length;
        csv += `${(prop.title || prop.address || prop.id).replace(/,/g, '')},${propCollected},${propOverdue},${tenantsCount}\n`;
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="financial-overview.csv"');
      return res.status(200).send(csv);
    }

    if (format === 'pdf') {
      // If GET PDF was requested, generate simple PDF
      const jsPDF = (await import('jspdf')).jsPDF as any;
      const doc = new jsPDF();
      doc.text('Financial Overview Report', 14, 20);

      // Totals
      const totalCollected = payments.filter((p: any) => String(p.status || '').toUpperCase() === 'PAID').reduce((s: number, p: any) => s + (p.amount || 0), 0);
      const totalOverdue = leases.filter((l: any) => l.dueDate && new Date(l.dueDate) < today && !payments.find((p: any) => p.leaseId === l.id && String(p.status || '').toUpperCase() === 'PAID')).reduce((s: number, l: any) => s + (l.rentAmount || 0), 0);
      doc.text(`Total Collected: $${totalCollected.toFixed(2)}`, 14, 30);
      doc.text(`Total Overdue: $${totalOverdue.toFixed(2)}`, 14, 38);

      let y = 50;
      doc.text('Recent Payments:', 14, y);
      y += 8;
      payments.slice(0, 50).forEach((p: any, i: number) => {
        const line = `${i + 1}. ${p.tenant?.name || ''} - ${p.lease?.property?.title || ''} - $${p.amount} - ${new Date(p.createdAt).toLocaleDateString()} - ${p.status}`;
        doc.text(line, 14, y);
        y += 8;
        if (y > 270) { doc.addPage(); y = 20; }
      });

      doc.addPage();
      doc.text('Per-Property Breakdown:', 14, 20);
      let y2 = 34;
      for (const prop of properties) {
        const propCollected = payments.filter((p: any) => p.lease && p.lease.propertyId === prop.id && String(p.status || '').toUpperCase() === 'PAID').reduce((s: number, p: any) => s + (p.amount || 0), 0);
        const propOverdue = leases.filter((l: any) => l.propertyId === prop.id && l.dueDate && new Date(l.dueDate) < today && !payments.find((p: any) => p.leaseId === l.id && String(p.status || '').toUpperCase() === 'PAID')).reduce((s: number, l: any) => s + (l.rentAmount || 0), 0);
        const tenantsCount = (prop.leases || []).length;
        const line = `${prop.title || prop.address || prop.id} — Collected: $${propCollected} — Overdue: $${propOverdue} — Tenants: ${tenantsCount}`;
        doc.text(line, 14, y2);
        y2 += 8;
        if (y2 > 270) { doc.addPage(); y2 = 20; }
      }

      const pdfBytes = doc.output('arraybuffer');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="financial-overview.pdf"');
      return res.status(200).send(Buffer.from(pdfBytes));
    }

    return res.status(400).json({ error: 'Invalid format' });

    return res.status(400).json({ error: 'Invalid format' });
  } catch (err: any) {
    console.error('admin export error', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
