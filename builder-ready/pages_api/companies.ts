import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const companies = await prisma.company.findMany({ include: { contacts: true }, orderBy: { createdAt: 'desc' } });
      const mapped = companies.map((c) => ({
        ...c,
        contacts: (c.contacts || []).map((ct) => ({ id: ct.id, name: `${ct.firstName || ''} ${ct.lastName || ''}`.trim() })),
      }));
      return res.status(200).json(mapped);
    }

    if (req.method === 'POST') {
      const { name, industry, website } = req.body || {};
      if (!name) return res.status(400).json({ error: 'name is required' });

      const company = await prisma.company.create({
        data: { name: String(name), industry: industry || null, website: website || null },
      });
      return res.status(201).json(company);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: any) {
    console.error('builder-ready/pages_api/companies error', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
