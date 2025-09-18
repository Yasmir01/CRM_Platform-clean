import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // For now return the first user found in DB
    const user: any = await prisma.user.findFirst();

    if (!user) {
      return res.status(404).json({ error: 'No user found' });
    }

    const role = user.role || 'Subscriber';

    return res.status(200).json({ role });
  } catch (error) {
    console.error('Error in /api/auth/session:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
