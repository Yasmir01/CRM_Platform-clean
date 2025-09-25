import type { NextApiRequest, NextApiResponse } from 'next';
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
    const id = (req.query as any).id as string | undefined;
    const startDate = (req.query as any).startDate as string | undefined;
    const endDate = (req.query as any).endDate as string | undefined;

    const take = Math.min(10000, Number((req.query as any).take || 1000));
    const where: any = {};

    if (filter === 'lease') {
      if (!id) return res.status(400).json({ error: 'Missing lease id for lease filter' });
      where.leaseId = String(id);
    } else if (filter === 'tenant') {
      if (!id) return res.status(400).json({ error: 'Missing tenant id for tenant filter' });
      where.tenantId = String(id);
    }

    if (startDate || endDate) {
      const dateFilter: any = {};
      if (startDate) {
        const sd = new Date(String(startDate));
        if (isNaN(sd.getTime())) return res.status(400).json({ error: 'Invalid startDate' });
        dateFilter.gte = sd;
      }
      if (endDate) {
        const ed = new Date(String(endDate));
        if (isNaN(ed.getTime())) return res.status(400).json({ error: 'Invalid endDate' });
        dateFilter.lte = ed;
      }
      where.date = dateFilter;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: { lease: true, tenant: true },
      orderBy: { date: 'desc' },
      take,
    });

    const mapped = payments.map((p) => ({
      'tenant.name': (p as any).tenant?.name || 'N/A',
      'lease.id': (p as any).lease?.id || 'N/A',
      amount: typeof (p as any).amount === 'number' ? (p as any).amount : p.amount,
      date: p.date ? new Date(p.date).toISOString() : '',
    }));

    const fields = ['tenant.name', 'lease.id', 'amount', 'date'];
    const parser = new Parser({ fields });
    const csv = parser.parse(mapped as any);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=payments_report.csv');
    return res.status(200).send(csv);
  } catch (err: any) {
    console.error('Failed to generate CSV export:', err?.message || err);
    return res.status(500).json({ error: 'Failed to generate CSV' });
  }
}
