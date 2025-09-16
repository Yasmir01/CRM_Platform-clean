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

        const companies = await prisma.company.findMany({ include: { contacts: true }, orderBy: { createdAt: 'desc' } });
        const mapped = companies.map((c) => ({
          ...c,
          contacts: (c.contacts || []).map((ct) => ({ id: ct.id, name: `${ct.firstName || ''} ${ct.lastName || ''}`.trim() })),
        }));
        return res.status(200).json(mapped);
      }

      case 'POST': {
        const { name, industry, website, phone, address } = req.body || {};
        if (!name) return res.status(400).json({ error: 'name is required' });
        const company = await prisma.company.create({ data: { name: String(name), industry: industry || null, website: website || null, phone: phone || null, address: address || null } });
        return res.status(201).json(company);
      }

      case 'PUT': {
        const { id, ...updateData } = req.body || {};
        if (!id) return res.status(400).json({ error: 'Missing id' });
        const updated = await prisma.company.update({ where: { id }, data: updateData });
        return res.status(200).json(updated);
      }

      case 'DELETE': {
        const id = String(req.body?.id || req.query?.id || '');
        if (!id) return res.status(400).json({ error: 'Missing id' });
        await prisma.company.delete({ where: { id } });
        return res.status(200).json({ message: 'Deleted successfully' });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err: any) {
    console.error('pages/api/companies error', err?.message || err);
    return res.status(500).json({ error: 'Server error', details: err?.message });
  }
}
