import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { sendEmail } from '../../src/lib/mailer';
import jsPDF from 'jspdf';
import { Parser } from 'json2csv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const today = new Date();

    // Fetch payments (use prisma.payment as in prompt)
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { tenant: true, lease: { include: { property: true } } },
    });

    // Fetch overdue leases (using lease.dueDate if available)
    const leases = await prisma.lease.findMany({ where: { active: true }, include: { tenant: true, property: true } });

    const overdueLeases = leases.filter((l: any) => {
      if (!l.dueDate) return false;
      return new Date(l.dueDate) < today && !payments.find((p: any) => p.leaseId === l.id && String(p.status).toUpperCase() === 'PAID');
    });

    // Generate CSV
    const fields = ['Tenant', 'Property', 'Amount', 'Date', 'Status'];
    const data = payments.map((p: any) => ({
      Tenant: p.tenant?.name || '',
      Property: p.lease?.property?.title || '',
      Amount: p.amount,
      Date: new Date(p.createdAt).toLocaleDateString(),
      Status: p.status,
    }));

    const parser = new Parser({ fields });
    const csv = parser.parse(data as any);
    const csvBuffer = Buffer.from(csv, 'utf-8');

    // Generate PDF
    const doc = new (jsPDF as any)();
    doc.text('Tenant Payments Report', 14, 20);

    let y = 40;
    payments.forEach((p: any, i: number) => {
      const line = `${i + 1}. ${p.tenant?.name || ''} - ${p.lease?.property?.title || ''} - $${p.amount} - ${new Date(
        p.createdAt
      ).toLocaleDateString()} - ${p.status}`;
      doc.text(line, 14, y);
      y += 10;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    doc.addPage();
    doc.text('Overdue Tenants', 14, 20);
    let y2 = 40;
    overdueLeases.forEach((l: any, i: number) => {
      const line = `${i + 1}. ${l.tenant?.name || ''} - ${l.property?.title || ''} - Due: ${new Date(
        l.dueDate
      ).toLocaleDateString()} - $${l.rentAmount}`;
      doc.text(line, 14, y2);
      y2 += 10;
      if (y2 > 270) {
        doc.addPage();
        y2 = 20;
      }
    });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Get Admins/Owners
    const recipients = await prisma.user.findMany({ where: { role: { in: ['ADMIN', 'OWNER'] } }, select: { email: true } });

    const sentTo: string[] = [];
    for (const r of recipients) {
      if (!r.email) continue;
      try {
        await sendEmail({
          to: r.email,
          subject: 'Weekly Tenant Payments Report',
          text: 'Attached are the latest tenant payments and overdue rent status.',
          attachments: [
            { filename: 'payments.csv', content: csvBuffer },
            { filename: 'payments.pdf', content: pdfBuffer },
          ],
        });
        sentTo.push(r.email);
      } catch (e: any) {
        console.error('Failed sending payment report to', r.email, e?.message || e);
      }
    }

    return res.status(200).json({ success: true, sentTo });
  } catch (err: any) {
    console.error('payment-reports error', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
