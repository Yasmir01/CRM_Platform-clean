import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../src/lib/prisma';
import { ensurePermission } from '../src/lib/authorize';

import PDFDocument from 'pdfkit';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = ensurePermission(req as any, res as any, '*');
  if (!user) return;

  try {
    const exportType = String((req.query?.export as string) || '').toLowerCase();
    const action = req.query?.action as string | undefined;
    const subscriberId = req.query?.subscriberId as string | undefined;
    const search = req.query?.search as string | undefined;

    const where: any = {};
    if (action) where.action = action;
    if (subscriberId) where.subscriberId = subscriberId;
    if (search) {
      where.OR = [
        { details: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { subscriber: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const history = await prisma.history.findMany({
      where,
      include: { user: { select: { email: true, role: true } }, subscriber: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    if (exportType === 'csv') {
      const { Parser } = await import('json2csv');
      const fields = ['id', 'action', 'details', 'createdAt', 'user.email', 'user.role', 'subscriber.name'];
      const parser = new Parser({ fields });
      const csv = parser.parse(history as any);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=history.csv');
      return res.status(200).send(csv);
    }

    if (exportType === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=history.pdf');

      const doc = new PDFDocument({ margin: 36 });
      doc.pipe(res);

      doc.fontSize(18).text('Super Admin Global History', { align: 'center' });
      doc.moveDown();

      history.forEach((h) => {
        doc
          .fontSize(12)
          .text(`Action: ${h.action}`)
          .text(`User: ${h.user?.email || 'system'} (${h.user?.role || '-'})`)
          .text(`Subscriber: ${h.subscriber?.name || 'N/A'}`)
          .text(`Time: ${new Date(h.createdAt).toLocaleString()}`)
          .text(`Details: ${h.details || ''}`)
          .moveDown();
      });

      doc.end();
      return;
    }

    return res.status(400).json({ error: 'Invalid export type' });
  } catch (err: any) {
    console.error('admin/history-export error', err?.message || err);
    return res.status(500).json({ error: 'failed' });
  }
}
