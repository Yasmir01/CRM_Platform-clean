import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { sendMail } from '../../../src/lib/mailer';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { isAuthorizedAdmin } from '../../_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const isCron = Boolean((req.headers['x-vercel-cron'] as string) || (req.headers['X-Vercel-Cron'] as any));
  if (!isCron && !isAuthorizedAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const sus = await prisma.user.findMany({ where: { role: 'SUPER_ADMIN' as any }, select: { email: true } });
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' as any }, select: { email: true } });

    const plans = await prisma.paymentPlan.findMany({ include: { installments: true, tenant: true }, orderBy: { createdAt: 'desc' } });

    // CSV
    const header = ['Tenant', 'Plan', 'Installment Due', 'Amount', 'Paid', 'Status'];
    const rows = plans.flatMap((p) =>
      p.installments.map((i) => [
        p.tenant?.email || 'N/A',
        p.title,
        new Date(i.dueDate).toISOString().slice(0, 10),
        (i.amount || 0).toFixed(2),
        (i.paidAmount || 0).toFixed(2),
        i.status,
      ])
    );
    const csvContent = [header, ...rows]
      .map((r) => r.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(','))
      .join('\n');

    // PDF via jsPDF + autotable
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Monthly Payment Plan Report', 14, 20);
    const body = rows.map((r) => r);
    (doc as any).autoTable({ startY: 30, head: [header], body, styles: { fontSize: 8 } });
    const pdfArrayBuffer = doc.output('arraybuffer');
    const pdfBuffer = Buffer.from(pdfArrayBuffer);

    const recipients = [...sus, ...admins].map((u) => u.email).filter(Boolean) as string[];
    let sent = 0;
    if (recipients.length) {
      await sendMail(recipients, 'Monthly Payment Plan Report', 'Attached are your monthly compliance reports in CSV and PDF.', [
        { filename: 'payment-plans.csv', content: csvContent },
        { filename: 'payment-plans.pdf', content: pdfBuffer },
      ]);
      sent = recipients.length;
    }

    return res.status(200).json({ ok: true, recipients: sent });
  } catch (e: any) {
    console.error('auto-export error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
