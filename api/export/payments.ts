import type { VercelRequest, VercelResponse } from '@vercel/node';
import PDFDocument from 'pdfkit';
import Stripe from 'stripe';
import { getUserOr401 } from '../../src/utils/authz';

const stripeSecret = process.env.STRIPE_SECRET_KEY as string | undefined;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2022-11-15' }) : (null as any);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;

  const format = (req.query?.format as string) || 'csv';

  try {
    if (!stripeSecret || !stripe) {
      res.setHeader('Content-Type', format === 'pdf' ? 'application/pdf' : 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=payments.${format}`);
      return res.status(200).send(format === 'pdf' ? '' : 'Payment ID,Amount,Currency,Status,Created At\n');
    }

    const tenantId = String((user as any).sub || (user as any).id);
    const list = await stripe.paymentIntents.list({ limit: 100 });
    const payments = list.data.filter((pi) => (pi.metadata?.tenantId || '') === tenantId);

    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=payments.pdf');

      const doc = new PDFDocument({ margin: 36 });
      doc.pipe(res);

      doc.fontSize(18).text('Payments Report', { align: 'center' });
      doc.moveDown();

      payments.forEach((p) => {
        doc
          .fontSize(12)
          .text(`Payment ID: ${p.id}`)
          .text(`Amount: $${(p.amount / 100).toFixed(2)} ${p.currency}`)
          .text(`Status: ${p.status}`)
          .text(`Created: ${new Date(p.created * 1000).toISOString()}`)
          .moveDown();
      });

      doc.end();
      return;
    }

    const header = 'Payment ID,Amount,Currency,Status,Created At\n';
    const rows = payments
      .map((p) => `${p.id},${(p.amount / 100).toFixed(2)},${p.currency},${p.status},${new Date(p.created * 1000).toISOString()}`)
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=payments.csv');
    return res.status(200).send(header + rows);
  } catch (err: any) {
    console.error('export/payments error', err?.message || err);
    return res.status(500).json({ error: 'failed' });
  }
}
