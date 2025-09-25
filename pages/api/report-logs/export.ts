import type { NextApiRequest, NextApiResponse } from 'next';
import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const format = (req.query.format as string) || 'csv'; // csv | pdf
    const recipient = (req.query.recipient as string) || '';
    const reportType = (req.query.reportType as string) || '';
    const startDate = (req.query.startDate as string) || '';
    const endDate = (req.query.endDate as string) || '';
    const filter = (req.query.filter as string) || '';
    const filterId = (req.query.filterId as string) || '';

    const where: any = {};
    if (recipient) where.recipient = { contains: recipient, mode: 'insensitive' };
    if (reportType) where.reportType = reportType;
    if (filter) where.filter = filter;
    if (filterId) where.filterId = filterId;
    if (startDate && endDate) {
      where.sentAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const logs = await prisma.reportEmailLog.findMany({
      where,
      orderBy: { sentAt: 'desc' },
      take: 5000,
    });

    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=report-email-logs.pdf');

      const doc = new PDFDocument({ margin: 36 });
      doc.pipe(res);

      doc.fontSize(16).text('Report Email Logs', { align: 'center' });
      doc.moveDown();

      logs.forEach((l) => {
        doc.fontSize(10).text(
          `Recipient: ${l.recipient} | Type: ${String(l.reportType).toUpperCase()} | Filter: ${l.filter}${
            l.filterId ? ' (' + l.filterId + ')' : ''
          } | Range: ${
            l.startDate && l.endDate
              ? new Date(l.startDate).toLocaleDateString() + ' → ' + new Date(l.endDate).toLocaleDateString()
              : '-'
          } | Sent At: ${new Date(l.sentAt).toLocaleString()}`
        );
        doc.moveDown(0.2);
      });

      doc.end();
      return;
    }

    const rows = logs.map((l) => ({
      recipient: l.recipient,
      reportType: l.reportType,
      filter: l.filter,
      filterId: l.filterId || '',
      startDate: l.startDate ? new Date(l.startDate).toISOString() : '',
      endDate: l.endDate ? new Date(l.endDate).toISOString() : '',
      sentAt: l.sentAt.toISOString(),
    }));

    const parser = new Parser({
      fields: ['recipient', 'reportType', 'filter', 'filterId', 'startDate', 'endDate', 'sentAt'],
    });
    const csv = parser.parse(rows as any);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=report-email-logs.csv');
    return res.status(200).send(csv);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to export report logs' });
  }
}
