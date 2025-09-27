import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const leases = await prisma.lease.findMany({
      select: { id: true },
      orderBy: { id: 'asc' },
      take: 1000,
    });
    return res.status(200).json(leases);
  } catch (error) {
    console.error('Failed to fetch leases:', error);
    return res.status(500).json({ error: 'Failed to fetch leases' });
  }
}
