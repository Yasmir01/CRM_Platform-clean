import type { NextApiRequest, NextApiResponse } from 'next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const page = Math.max(parseInt(String(req.query.page || '1'), 10), 1);
      const limit = Math.max(parseInt(String(req.query.limit || '10'), 10), 1);
      const skip = (page - 1) * limit;

      const sortField = String(req.query.sortField || 'createdAt');
      const sortOrder = String(req.query.sortOrder || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';

      const scalarFields = new Set(['name', 'industry', 'website', 'createdAt']);
      let orderBy: any = { createdAt: sortOrder };
      if (scalarFields.has(sortField)) {
        orderBy = { [sortField]: sortOrder };
      } else {
        orderBy = { createdAt: sortOrder };
      }

      const [companies, total] = await Promise.all([
        prisma.company.findMany({ skip, take: limit, orderBy, include: { contacts: true } }),
        prisma.company.count(),
      ]);

      const data = companies.map((c) => ({
        id: c.id,
        name: c.name,
        industry: c.industry || '',
        website: c.website || null,
        createdAt: c.createdAt,
      }));

      const totalPages = Math.max(Math.ceil(total / limit), 1);
      const hasMore = page < totalPages;

      return res.status(200).json({ data, total, page, totalPages, hasMore });
    }

    if (req.method === 'POST') {
      const { name, industry, website, phone, address } = req.body || {};
      if (!name) return res.status(400).json({ error: 'name is required' });
      const company = await prisma.company.create({ data: { name: String(name), industry: industry || null, website: website || null, phone: phone || null, address: address || null } });
      return res.status(201).json(company);
    }

    if (req.method === 'PUT') {
      const { id, ...updateData } = req.body || {};
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const updated = await prisma.company.update({ where: { id }, data: updateData });
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      const id = String(req.body?.id || req.query?.id || '');
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await prisma.company.delete({ where: { id } });
      return res.status(200).json({ message: 'Deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: any) {
    console.error('pages/api/companies error', err?.message || err);
    return res.status(500).json({ error: 'Server error', details: err?.message });
  }
}
