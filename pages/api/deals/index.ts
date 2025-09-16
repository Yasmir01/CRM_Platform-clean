import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const deals = await prisma.deal.findMany({
        where: { deleted: false },
        include: { company: true, contact: true },
      })
      return res.status(200).json(deals)
    }

    if (req.method === 'POST') {
      const { title, description, amount, stage, probability, status, orgId, companyId, contactId } = req.body
      const deal = await prisma.deal.create({
        data: { title, description, amount, stage, probability, status, orgId, companyId, contactId }
      })
      return res.status(201).json(deal)
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err: any) {
    console.error('pages/api/deals/index error', err?.message || err)
    res.status(500).json({ error: err?.message || 'Server error' })
  }
}
