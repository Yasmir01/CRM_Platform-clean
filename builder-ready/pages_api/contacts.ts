import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { companyId } = req.query;
      const where = companyId ? { companyId: String(companyId) } : {};
      const contacts = await prisma.contact.findMany({ where, include: { company: true } });
      return res.status(200).json(contacts);
    }

    if (req.method === 'POST') {
      const { firstName, lastName, email, phone, companyId, notes } = req.body || {};
      if (!firstName || !email) return res.status(400).json({ error: 'firstName and email are required' });

      const contact = await prisma.contact.create({
        data: {
          firstName: String(firstName),
          lastName: lastName ? String(lastName) : '',
          email: String(email),
          phone: phone || null,
          notes: notes || null,
          company: companyId ? { connect: { id: String(companyId) } } : undefined,
        },
      });

      return res.status(201).json(contact);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: any) {
    console.error('builder-ready/pages_api/contacts error', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
