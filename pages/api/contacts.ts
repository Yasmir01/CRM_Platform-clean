import type { NextApiRequest, NextApiResponse } from 'next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET': {
        const id = String(req.query?.id || '');
        const companyId = String(req.query?.companyId || '');
        if (id) {
          const contact = await prisma.contact.findUnique({ where: { id }, include: { company: true } });
          if (!contact) return res.status(404).json({ error: 'Not found' });
          return res.status(200).json(contact);
        }

        const where = companyId ? { companyId } : undefined;
        const contacts = await prisma.contact.findMany({ where, include: { company: true } });
        return res.status(200).json(contacts);
      }

      case 'POST': {
        const { firstName, lastName, email, phone, companyId, position } = req.body || {};
        if (!firstName || !email) return res.status(400).json({ error: 'firstName and email are required' });

        const data: any = {
          firstName: String(firstName),
          lastName: lastName ? String(lastName) : '',
          email: String(email),
          phone: phone || null,
          position: position || null,
        };

        if (companyId) {
          data.company = { connect: { id: String(companyId) } };
        }

        const contact = await prisma.contact.create({ data });
        return res.status(201).json(contact);
      }

      case 'PUT': {
        const { id, ...updateData } = req.body || {};
        if (!id) return res.status(400).json({ error: 'Missing id' });

        const data: any = { ...updateData };
        // allow updating relation via companyId
        if (updateData.companyId === null) {
          data.companyId = null;
        } else if (updateData.companyId) {
          data.company = { connect: { id: String(updateData.companyId) } };
          delete data.companyId;
        }

        const updated = await prisma.contact.update({ where: { id }, data });
        return res.status(200).json(updated);
      }

      case 'DELETE': {
        const id = String(req.body?.id || req.query?.id || '');
        if (!id) return res.status(400).json({ error: 'Missing id' });
        await prisma.contact.delete({ where: { id } });
        return res.status(200).json({ message: 'Deleted successfully' });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err: any) {
    console.error('pages/api/contacts error', err?.message || err);
    return res.status(500).json({ error: 'Server error', details: err?.message });
  }
}
