import type { NextApiRequest, NextApiResponse } from 'next';
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import PDFDocument from 'pdfkit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const filter = String((req.query as any).filter || 'all');
    const id = (req.query as any).id as string | undefined;

    // Basic query — adjust filter handling as needed
    const take = Math.min(10000, Number((req.query as any).take || 1000));
    const where: any = {};

    if (filter === 'lease') {
      if (!id) return res.status(400).json({ error: 'Missing lease id for lease filter' });
      where.leaseId = String(id);
    } else if (filter === 'tenant') {
      if (!id) return res.status(400).json({ error: 'Missing tenant id for tenant filter' });
      where.tenantId = String(id);
    }

    const payments = await prisma.payment.findMany({
      where,
      include: { lease: true, tenant: true },
      orderBy: { date: 'desc' },
      take,
    });

    const doc = new PDFDocument({ margin: 36 });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => {
      const pdf = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=payments_report.pdf');
      return res.status(200).send(pdf);
    });

    // Title
    doc.fontSize(18).text('Payments Report', { align: 'center' }).moveDown();

    // Table header
    doc.fontSize(12).text('Date  |  Tenant  |  Lease  |  Amount');
    doc.moveDown(0.5);

    payments.forEach((p) => {
      const date = p.date ? new Date(p.date).toISOString() : '';
      const tenant = (p as any).tenant?.name || 'N/A';
      const lease = (p as any).lease?.id || 'N/A';
      const amount = typeof (p as any).amount === 'number' ? `$${(p as any).amount.toFixed(2)}` : String((p as any).amount || '');

      doc.fontSize(11).text(`${date}  |  ${tenant}  |  ${lease}  |  ${amount}`);
      doc.moveDown(0.2);
    });

    doc.end();
  } catch (err: any) {
    console.error('Failed to generate PDF export:', err?.message || err);
    return res.status(500).json({ error: 'Failed to generate PDF' });
  }
}
