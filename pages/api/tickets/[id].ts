import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

// GET / PUT / DELETE single ticket
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  try {
    if (req.method === 'GET') {
      const ticket = await prisma.ticket.findUnique({ where: { id } });
      if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
      return res.status(200).json(ticket);
    }

    if (req.method === 'PUT') {
      const { title, description, priority, status, companyId, contactId } = req.body || {};
      const data: any = {};
      if (title !== undefined) data.title = String(title);
      if (description !== undefined) data.description = description === null ? null : String(description);
      if (priority !== undefined) data.priority = priority;
      if (status !== undefined) data.status = status;
      if (companyId !== undefined) data.companyId = companyId || null;
      if (contactId !== undefined) data.contactId = contactId || null;

      const updated = await prisma.ticket.update({ where: { id }, data });
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      await prisma.ticket.delete({ where: { id } });
      return res.status(204).end();
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: any) {
    console.error('pages/api/tickets/[id].ts error', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
