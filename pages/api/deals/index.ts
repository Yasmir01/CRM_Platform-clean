import type { NextApiRequest, NextApiResponse } from 'next'
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import { getUserOr401 } from '@/utils/authz';
import { runWithRequestSession } from '@/lib/runWithRequestSession';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserOr401(req as any, res as any);
  if (!user) return;

  return runWithRequestSession(req as any, async () => {
    try {
      if (req.method === 'GET') {
        const { page = '1', pageSize = '10', search = '' } = req.query;
        const skip = (parseInt(page as string, 10) - 1) * parseInt(pageSize as string, 10);
        const take = parseInt(pageSize as string, 10);

        const where = search
          ? {
              AND: [{ deleted: false }],
              OR: [
                { title: { contains: search as string, mode: 'insensitive' } },
                { status: { contains: search as string, mode: 'insensitive' } },
              ],
            }
          : { deleted: false };

        const [deals, total] = await Promise.all([
          prisma.deal.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { company: true, contact: true } }),
          prisma.deal.count({ where }),
        ]);

        return res.status(200).json({ data: deals, total });
      }

      if (req.method === 'POST') {
        const { title, value, status, companyId, contactId } = req.body || {};
        if (!title || typeof title !== 'string') return res.status(400).json({ error: 'Title is required' });

        const deal = await prisma.deal.create({ data: { title: title.trim(), value: Number(value) || 0, status: (status || 'Open') as string, companyId, contactId } });
        return res.status(201).json(deal);
      }

      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (err: any) {
      console.error('pages/api/deals/index error', err?.message || err);
      return res.status(500).json({ error: err?.message || 'Server error' });
    }
  });
}
