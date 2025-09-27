import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const tenants = await prisma.tenant.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    return res.status(200).json(tenants);
  } catch (error) {
    console.error('Failed to fetch tenants:', error);
    return res.status(500).json({ error: 'Failed to fetch tenants' });
  }
}
