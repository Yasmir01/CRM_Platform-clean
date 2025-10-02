import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const skip = (page - 1) * limit;

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

    const [logs, total] = await Promise.all([
      prisma.reportEmailLog.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.reportEmailLog.count({ where }),
    ]);

    return res.status(200).json({
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch report logs' });
  }
}
