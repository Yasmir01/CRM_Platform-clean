import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { prisma } from '../../api/_db';
import { prisma } from '../../pages/api/_db';

export async function generateInvoicePdf(invoice: any, accountId: string) {
  const account = accountId ? await prisma.account.findUnique({ where: { id: accountId } }) : null;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Header: Company Name (and logo if available)
  let cursorY = height - 40;
  if (account?.logoUrl) {
    try {
      const res = await fetch(account.logoUrl);
      if (res.ok) {
        const imgBuf = await res.arrayBuffer();
        // try PNG first
        try {
          const img = await pdfDoc.embedPng(new Uint8Array(imgBuf));
          page.drawImage(img, { x: 40, y: height - 90, width: 120, height: 50 });
          cursorY = height - 100;
        } catch (e) {
          try {
            const img = await pdfDoc.embedJpg(new Uint8Array(imgBuf));
            page.drawImage(img, { x: 40, y: height - 90, width: 120, height: 50 });
            cursorY = height - 100;
          } catch (e2) {
            // ignore image embed errors
            cursorY = height - 40;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to fetch/embed logo', e);
    }
  }

  // Company name & contact
  page.drawText(account?.name || 'Your Company', { x: 180, y: height - 40, size: 18, font, color: rgb(0, 0, 0) });
  if (account?.address) page.drawText(String(account.address), { x: 180, y: height - 58, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  if (account?.phone) page.drawText(`Phone: ${account.phone}`, { x: 180, y: height - 72, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
  if (account?.email) page.drawText(`Email: ${account.email}`, { x: 180, y: height - 86, size: 10, font, color: rgb(0.2, 0.2, 0.2) });

  // Invoice title and meta
  const invoiceNumber = invoice.number || invoice.id || '—';
  page.drawText(`Invoice #${invoiceNumber}`, { x: 40, y: cursorY - 40, size: 14, font, color: rgb(0.1, 0.1, 0.1) });

  const periodStart = invoice.period_start ? new Date(invoice.period_start * 1000) : undefined;
  const periodEnd = invoice.period_end ? new Date(invoice.period_end * 1000) : undefined;
  const periodText = periodStart && periodEnd ? `Period: ${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()}` : '';
  if (periodText) page.drawText(periodText, { x: 40, y: cursorY - 58, size: 10, font });

  const billingTo = invoice.customer_name || invoice.customer || invoice.customer_email || 'Customer';
  page.drawText(`Bill To: ${billingTo}`, { x: 40, y: cursorY - 78, size: 10, font });

  // Line items header
  let y = cursorY - 110;
  page.drawText('Description', { x: 40, y, size: 11, font, color: rgb(0.1, 0.1, 0.1) });
  page.drawText('Amount', { x: 450, y, size: 11, font, color: rgb(0.1, 0.1, 0.1) });
  y -= 18;

  // Items
  const lines = (invoice.lines && invoice.lines.data) || [];
  for (const item of lines) {
    const desc = item.description || item.description || (item.plan && item.plan.nickname) || 'Item';
    const amount = typeof item.amount === 'number' ? item.amount : (item.amount_in_cents || item.unit_amount || 0);
    page.drawText(String(desc), { x: 40, y, size: 10, font });
    page.drawText(`$${((amount || 0) / 100).toFixed(2)}`, { x: 450, y, size: 10, font });
    y -= 16;
    if (y < 80) {
      // add page
      const newPage = pdfDoc.addPage([595, 842]);
      y = newPage.getSize().height - 80;
    }
  }

  // Totals
  const due = typeof invoice.amount_due === 'number' ? invoice.amount_due : (invoice.total || invoice.amount_paid || 0);
  page.drawText(`Total Due: $${((due || 0) / 100).toFixed(2)}`, { x: 40, y: y - 20, size: 12, font, color: rgb(0, 0, 0) });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
