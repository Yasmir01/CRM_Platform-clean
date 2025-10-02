import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  try {
    if (req.method === 'GET') {
      const deal = await prisma.deal.findUnique({ where: { id: String(id) }, include: { company: true, contact: true } })
      if (!deal) return res.status(404).json({ error: 'Not found' })
      return res.status(200).json(deal)
    }

    if (req.method === 'PATCH') {
      const data = req.body
      const updated = await prisma.deal.update({
        where: { id: String(id) },
        data
      })
      return res.status(200).json(updated)
    }

    if (req.method === 'DELETE') {
      const deleted = await prisma.deal.update({
        where: { id: String(id) },
        data: { deleted: true }
      })
      return res.status(200).json(deleted)
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err: any) {
    console.error('pages/api/deals/[id] error', err?.message || err)
    res.status(500).json({ error: err?.message || 'Server error' })
  }
}
