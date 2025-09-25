import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const page = Math.max(parseInt(String(req.query.page || '1'), 10), 1);
    const limit = Math.max(parseInt(String(req.query.limit || '10'), 10), 1);
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.reportEmailLog.findMany({
        orderBy: { sentAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.reportEmailLog.count(),
    ]);

    return res.status(200).json({
      logs,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    console.error('Failed to fetch report logs:', error);
    return res.status(500).json({ error: 'Failed to fetch report logs' });
  }
}
