import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      filter,
      id,
      startDate,
      endDate,
      type,
      recipient,
    } = req.body as {
      filter?: string;
      id?: string;
      startDate?: string;
      endDate?: string;
      type?: 'pdf' | 'csv' | string;
      recipient?: string;
    };

    if (!recipient || typeof recipient !== 'string') {
      return res.status(400).json({ error: 'Missing recipient email' });
    }

    // Build where clause
    const where: any = {};
    if (filter === 'tenant' && id) where.tenantId = String(id);
    if (filter === 'lease' && id) where.leaseId = String(id);

    if (startDate || endDate) {
      const dateFilter: any = {};
      if (startDate) {
        const sd = new Date(String(startDate));
        if (isNaN(sd.getTime())) return res.status(400).json({ error: 'Invalid startDate' });
        dateFilter.gte = sd;
      }
      if (endDate) {
        const ed = new Date(String(endDate));
        if (isNaN(ed.getTime())) return res.status(400).json({ error: 'Invalid endDate' });
        dateFilter.lte = ed;
      }
      where.date = dateFilter;
    }

    // Resolve recipient; support special keyword 'owner' to auto-fetch owner email for a lease
    let actualRecipient = recipient;
    if (recipient === 'owner') {
      if (filter === 'lease' && id) {
        const leaseRecord = await prisma.lease.findUnique({ where: { id: String(id) }, include: { owner: true } });
        if (!leaseRecord || !leaseRecord.owner || !leaseRecord.owner.email) {
          return res.status(400).json({ error: 'Owner email not found for this lease' });
        }
        actualRecipient = leaseRecord.owner.email;
      } else {
        return res.status(400).json({ error: 'Owner auto-email requires lease filter + id' });
      }
    }

    const payments = await prisma.payment.findMany({
      where,
      include: { lease: true, tenant: true },
      orderBy: { date: 'desc' },
      take: 10000,
    });

    if (!type || (type !== 'pdf' && type !== 'csv')) {
      return res.status(400).json({ error: 'Invalid or missing type (pdf|csv)' });
    }

    // helper to send email
    async function sendEmail(to: string, filename: string, content: Buffer, mimeType: string) {
      const host = process.env.SMTP_HOST;
      const port = Number(process.env.SMTP_PORT || 0);
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;
      const from = process.env.SMTP_FROM || 'no-reply@crm-platform.com';

      if (!host || !port || !user || !pass) {
        console.error('SMTP not configured');
        throw new Error('SMTP not configured');
      }

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465, false for other ports
        auth: { user, pass },
      });

      await transporter.sendMail({
        from,
        to,
        subject: 'Payment Report Export',
        text: 'Attached is your requested payment report.',
        attachments: [
          { filename, content, contentType: mimeType },
        ],
      });
    }

    if (type === 'pdf') {
      const filename = 'payments_report.pdf';
      const doc = new PDFDocument({ margin: 36 });
      const chunks: Buffer[] = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', async () => {
        try {
          const pdfBuffer = Buffer.concat(chunks);
          await sendEmail(recipient, filename, pdfBuffer, 'application/pdf');
          return res.status(200).json({ message: 'Email sent successfully' });
        } catch (err: any) {
          console.error('Failed to send email with PDF:', err);
          return res.status(500).json({ error: 'Failed to send email' });
        }
      });

      // build PDF
      doc.fontSize(18).text('Payments Report', { align: 'center' }).moveDown();
      doc.fontSize(12).text('Date  |  Tenant  |  Lease  |  Amount');
      doc.moveDown(0.5);
      payments.forEach((p) => {
        const date = p.date ? new Date(p.date).toISOString() : '';
        const tenantName = (p as any).tenant?.name || 'N/A';
        const leaseId = (p as any).lease?.id || 'N/A';
        const amount = typeof (p as any).amount === 'number' ? `$${(p as any).amount.toFixed(2)}` : String((p as any).amount || '');
        doc.fontSize(11).text(`${date}  |  ${tenantName}  |  ${leaseId}  |  ${amount}`);
        doc.moveDown(0.2);
      });
      doc.end();
      return; // response handled in 'end' listener
    }

    // CSV branch
    const fields = ['tenant.name', 'lease.id', 'amount', 'date'];
    const mapped = payments.map((p) => ({
      'tenant.name': (p as any).tenant?.name || 'N/A',
      'lease.id': (p as any).lease?.id || 'N/A',
      amount: typeof (p as any).amount === 'number' ? (p as any).amount : p.amount,
      date: p.date ? new Date(p.date).toISOString() : '',
    }));

    const parser = new Parser({ fields });
    const csv = parser.parse(mapped as any);
    const csvBuffer = Buffer.from(csv, 'utf-8');

    await sendEmail(recipient, 'payments_report.csv', csvBuffer, 'text/csv');
    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (err: any) {
    console.error('Failed to send export email:', err?.message || err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
