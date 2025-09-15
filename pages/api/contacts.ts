import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET': {
        const companyId = String(req.query?.companyId || '');
        if (companyId) {
          const contacts = await prisma.contact.findMany({ where: { companyId }, include: { company: true, owner: true } });
          return res.status(200).json(contacts);
        }
        const contacts = await prisma.contact.findMany({ include: { company: true, owner: true } });
        return res.status(200).json(contacts);
      }
      case 'POST': {
        const { firstName, lastName, email, phone, companyId, ownerId } = req.body;
        const contact = await prisma.contact.create({ data: { firstName, lastName, email, phone, companyId, ownerId } });
        return res.status(201).json(contact);
      }
      case 'PATCH': {
        const { id, ...updates } = req.body;
        if (!id) return res.status(400).json({ error: 'Missing id' });
        const contact = await prisma.contact.update({ where: { id }, data: updates });
        return res.status(200).json(contact);
      }
      case 'DELETE': {
        const { id } = req.body;
        if (!id) return res.status(400).json({ error: 'Missing id' });
        await prisma.contact.delete({ where: { id } });
        return res.status(204).end();
      }
      default:
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err: any) {
    console.error('pages/api/contacts error', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
}
