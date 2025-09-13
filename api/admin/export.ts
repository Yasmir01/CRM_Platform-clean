import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userPayload = getUserOr401(req, res);
  if (!userPayload) return;

  const userId = String(userPayload.sub || userPayload?.id || '');
  const dbUser = await prisma.user.findUnique({ where: { id: userId }, include: { account: true } });
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

    // Support POST branded PDF
    if (req.method === 'POST') {
      const raw = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const chartImage = raw.chartImage as string | undefined | null;

      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable');
      const doc = new jsPDF();

      // Header
      doc.setFontSize(18);
      doc.setTextColor('#111827');
      doc.text('📊 Financial Overview Report', 14, 22);
      doc.setFontSize(10);
      doc.setTextColor('#6B7280');
      doc.text(`Generated: ${today.toLocaleDateString()}`, 14, 30);

      // Summary table
      (doc as any).autoTable({
        startY: 36,
        head: [['Total Collected', 'Total Overdue', 'Active Tenants']],
        body: [[
          `$${payments.filter((p:any)=>String(p.status||'').toUpperCase()==='PAID').reduce((s:number,p:any)=>s+(p.amount||0),0).toLocaleString()}`,
          `$${leases.filter((l:any)=>l.dueDate && new Date(l.dueDate) < today && !payments.find((p:any)=>p.leaseId===l.id && String(p.status||'').toUpperCase()==='PAID')).reduce((s:number,l:any)=>s+(l.rentAmount||0),0).toLocaleString()}`,
          `${leases.length}`
        ]],
        theme: 'grid',
      });

      // Property breakdown
      const propertyRows = properties.map((prop:any)=>{
        const propCollected = payments.filter((p:any)=>p.lease && p.lease.propertyId===prop.id && String(p.status||'').toUpperCase()==='PAID').reduce((s:number,p:any)=>s+(p.amount||0),0);
        const propOverdue = leases.filter((l:any)=>l.propertyId===prop.id && l.dueDate && new Date(l.dueDate) < today && !payments.find((p:any)=>p.leaseId===l.id && String(p.status||'').toUpperCase()==='PAID')).reduce((s:number,l:any)=>s+(l.rentAmount||0),0);
        return [prop.title || prop.address || prop.id, `$${propCollected.toLocaleString()}`, `$${propOverdue.toLocaleString()}`, (prop.leases||[]).length];
      });

      (doc as any).autoTable({
        startY: (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 60,
        head: [['Property','Collected','Overdue','Tenants']],
        body: propertyRows,
        theme: 'striped',
      });

      // Chart image
      if (chartImage) {
        try {
          doc.addPage();
          doc.setFontSize(14);
          doc.text('Rent Collection Trend', 14, 20);
          doc.addImage(chartImage, 'PNG', 14, 30, 180, 100);
        } catch (e) {
          console.warn('Failed to embed chart image', e);
        }
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
