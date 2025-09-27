import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

// GET all tickets / POST new ticket
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const tickets = await prisma.ticket.findMany({
        include: { company: true, contact: true },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(tickets);
    }

    if (req.method === 'POST') {
      const { title, description, priority, status, companyId, contactId } = req.body || {};
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const data: any = {
        title: String(title),
        description: description === undefined ? null : String(description),
        priority: priority || undefined,
        status: status || undefined,
      };

      if (companyId !== undefined) data.companyId = companyId || null;
      if (contactId !== undefined) data.contactId = contactId || null;

      const ticket = await prisma.ticket.create({ data });
      return res.status(201).json(ticket);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: any) {
    console.error('pages/api/tickets/index.ts error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
