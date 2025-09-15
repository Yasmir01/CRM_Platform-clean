import { prisma } from './prisma';
import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';

export async function generateCSV(): Promise<string> {
  const history = await prisma.history.findMany({
    include: {
      user: { select: { email: true, role: true } },
      subscriber: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const fields = ['id', 'action', 'details', 'createdAt', 'user.email', 'user.role', 'subscriber.name'];
  const parser = new Parser({ fields });
  const csv = parser.parse(history as any);
  return csv;
}

export async function generatePDF(): Promise<Buffer> {
  const history = await prisma.history.findMany({
    include: {
      user: { select: { email: true, role: true } },
      subscriber: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const doc = new PDFDocument({ margin: 36 });
  const chunks: Buffer[] = [];

  return new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));

    doc.fontSize(18).text('CRM History Export', { align: 'center' }).moveDown();

    history.forEach((entry) => {
      const time = new Date(entry.createdAt).toLocaleString();
      const user = entry.user?.email ? `${entry.user.email} (${entry.user.role || '-'})` : 'system';
      const sub = entry.subscriber?.name || 'N/A';
      doc.fontSize(12).text(`[${time}] ${entry.action} by ${user} ${entry.subscriber?.name ? `→ ${sub}` : ''}`);
      if (entry.details) {
        doc.fontSize(10).fillColor('gray').text(String(entry.details)).fillColor('black');
      }
      doc.moveDown(0.5);
    });

    doc.end();
  });
}
