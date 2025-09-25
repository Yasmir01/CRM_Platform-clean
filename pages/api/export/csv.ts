import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { Parser } from 'json2csv';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const filter = String((req.query as any).filter || 'all');

    const take = Math.min(10000, Number((req.query as any).take || 1000));
    const where: any = {};

    if (filter === 'lease' && req.query.leaseId) {
      where.leaseId = String(req.query.leaseId);
    } else if (filter === 'tenant' && req.query.tenantId) {
      where.tenantId = String(req.query.tenantId);
    }

    const payments = await prisma.payment.findMany({
      where,
      include: { lease: true, tenant: true },
      orderBy: { date: 'desc' },
      take,
    });

    const rows = payments.map((p) => ({
      tenantName: (p as any).tenant?.name || '',
      leaseId: (p as any).lease?.id || '',
      amount: typeof (p as any).amount === 'number' ? (p as any).amount.toFixed(2) : String((p as any).amount || ''),
      date: p.date ? new Date(p.date).toISOString() : '',
    }));

    const fields = ['tenantName', 'leaseId', 'amount', 'date'];
    const parser = new Parser({ fields });
    const csv = parser.parse(rows as any);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=payments_report.csv');
    return res.status(200).send(csv);
  } catch (err: any) {
    console.error('Failed to generate CSV export:', err?.message || err);
    return res.status(500).json({ error: 'Failed to generate CSV' });
  }
}
