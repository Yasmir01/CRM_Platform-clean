import type { NextApiRequest, NextApiResponse } from 'next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET': {
        const id = String(req.query?.id || '');
        if (id) {
          const company = await prisma.company.findUnique({ where: { id }, include: { contacts: true } });
          if (!company) return res.status(404).json({ error: 'Not found' });
          return res.status(200).json(company);
        }
        const companies = await prisma.company.findMany({ include: { contacts: true } });
        return res.status(200).json(companies);
      }
      case 'POST': {
        const { name, domain, industry } = req.body;
        const company = await prisma.company.create({ data: { name, domain, industry } });
        return res.status(201).json(company);
      }
      case 'PATCH': {
        const { id, ...updates } = req.body;
        if (!id) return res.status(400).json({ error: 'Missing id' });
        const company = await prisma.company.update({ where: { id }, data: updates });
        return res.status(200).json(company);
      }
      case 'DELETE': {
        const { id } = req.body;
        if (!id) return res.status(400).json({ error: 'Missing id' });
        await prisma.company.delete({ where: { id } });
        return res.status(204).end();
      }
      default:
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err: any) {
    console.error('pages/api/companies error', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
}
