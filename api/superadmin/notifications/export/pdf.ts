import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../../_db';
import { ensurePermission } from '../../../../src/lib/authorize';
import PDFDocument from 'pdfkit';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });

  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    const doc = new PDFDocument({ margin: 30 });
    const chunks: Buffer[] = [];
    doc.on('data', (c: any) => chunks.push(Buffer.from(c)));

    const bufferPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));
    });

    doc.fontSize(18).text('Notification History', { align: 'center' });
    doc.moveDown();

    notifications.forEach((n) => {
      doc.fontSize(12).text(`Title: ${n.title}`);
      doc.text(`Message: ${n.message}`);
      doc.text(`Audience: ${n.audience}`);
      doc.text(`Date: ${new Date(n.createdAt).toLocaleString()}`);
      doc.moveDown();
    });

    doc.end();

    const buffer = await bufferPromise;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=notifications.pdf');
    return res.status(200).send(buffer);
  } catch (e: any) {
    console.error('notifications export pdf error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
