import type { VercelRequest, VercelResponse } from '@vercel/node';
import PDFDocument from 'pdfkit';
import { getUserOr401 } from '../../src/utils/authz';
import quotes from '../../src/crm/data/addOnQuotes';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;

  const format = (req.query?.format as string) || 'csv';

  try {
    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=quotes.pdf');

      const doc = new PDFDocument({ margin: 36 });
      doc.pipe(res);

      doc.fontSize(18).text('Quotes Report', { align: 'center' });
      doc.moveDown();

      quotes.forEach((q: any) => {
        doc
          .fontSize(12)
          .text(`Quote ID: ${q.id}`)
          .text(`Quote #: ${q.quoteNumber}`)
          .text(`Customer: ${q.customerName} (${q.customerEmail})`)
          .text(`Product: ${q.productName}`)
          .text(`Subtotal: $${Number(q.subtotal).toFixed(2)}`)
          .text(`Discount: $${Number(q.discount).toFixed(2)}`)
          .text(`Total: $${Number(q.total).toFixed(2)}`)
          .text(`Status: ${q.status}`)
          .text(`Valid Until: ${q.validUntil}`)
          .text(`Created: ${q.dateCreated}`)
          .text(`Modified: ${q.dateModified}`)
          .moveDown();
      });

      doc.end();
      return;
    }

    // CSV
    const header = 'Quote ID,Quote #,Customer,Email,Product,Subtotal,Discount,Total,Status,Valid Until,Created,Modified\n';
    const rows = quotes
      .map((q: any) =>
        [
          q.id,
          q.quoteNumber,
          q.customerName,
          q.customerEmail,
          q.productName,
          Number(q.subtotal).toFixed(2),
          Number(q.discount).toFixed(2),
          Number(q.total).toFixed(2),
          q.status,
          q.validUntil,
          q.dateCreated,
          q.dateModified,
        ].map((v) => String(v).replace(/\n/g, ' ')).join(',')
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=quotes.csv');
    return res.status(200).send(header + rows);
  } catch (err: any) {
    console.error('export/quotes error', err?.message || err);
    return res.status(500).json({ error: 'failed' });
  }
}
