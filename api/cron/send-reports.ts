import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { sendMail } from '../../src/lib/mailer';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const prefs = await prisma.reportPreference.findMany({ where: { NOT: { frequency: 'none' } }, include: { user: true } });

    for (const pref of prefs) {
      // fetch leads for the user's org (if user has orgId)
      const orgId = (pref.user as any).orgId as string | undefined;
      const where: any = {};
      if (orgId) where.property = { orgId };

      const leads = await prisma.lead.findMany({ where, include: { property: true } });

      if (!leads || leads.length === 0) continue;

      let attachment: { filename: string; content: Buffer; contentType?: string } | null = null;

      if (pref.format === 'csv') {
        const csv = Papa.unparse(
          leads.map((l: any) => ({ Name: l.name, Email: l.email, Phone: l.phone || '', Property: l.property?.title || '', Created: new Date(l.createdAt).toLocaleString() }))
        );
        attachment = { filename: 'leads.csv', content: Buffer.from(csv, 'utf-8'), contentType: 'text/csv' };
      }

      if (pref.format === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(
          leads.map((l: any) => ({ Name: l.name, Email: l.email, Phone: l.phone || '', Property: l.property?.title || '', Created: new Date(l.createdAt).toLocaleString() }))
        );
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
        const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        attachment = { filename: 'leads.xlsx', content: buf as Buffer, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
      }

      if (pref.format === 'pdf') {
        const doc = new jsPDF();
        doc.text('Leads Report', 14, 16);
        const tableData = leads.map((l: any) => [l.name, l.email, l.phone || '', l.property?.title || '', new Date(l.createdAt).toLocaleString()]);
        (doc as any).autoTable({ head: [['Name', 'Email', 'Phone', 'Property', 'Created']], body: tableData, startY: 24 });
        const pdfBuffer = doc.output('arraybuffer');
        attachment = { filename: 'leads.pdf', content: Buffer.from(pdfBuffer), contentType: 'application/pdf' };
      }

      if (!attachment) continue;

      // send email
      try {
        await sendMail([pref.user.email], `Leads Report (${pref.frequency})`, 'Attached is your leads report.', [
          { filename: attachment.filename, content: attachment.content },
        ]);
      } catch (e: any) {
        console.error('failed sending report to', pref.user.email, e?.message || e);
      }
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('cron send-reports error', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
