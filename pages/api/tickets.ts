import type { NextApiRequest, NextApiResponse } from "next";
import prisma from '@/lib/prisma';
import { getUserOr401 } from '@/utils/authz';
import { runWithRequestSession } from '@/lib/runWithRequestSession';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserOr401(req as any, res as any);
  if (!user) return;

  return runWithRequestSession(req as any, async () => {
    if (req.method === "GET") {
      try {
        const page = Math.max(parseInt((req.query.page as string) || "1", 10), 1);
        const limit = Math.max(parseInt((req.query.pageSize as string) || "10", 10), 1);
        const skip = (page - 1) * limit;

        const search = String(req.query.search || "").trim();

        const where: any = {};
        if (search) {
          where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ];
        }

        const [tickets, total] = await Promise.all([
          prisma.ticket.findMany({
            skip,
            take: limit,
            where,
            include: { company: true, contact: true },
            orderBy: { createdAt: 'desc' },
          }),
          prisma.ticket.count({ where }),
        ]);

        return res.status(200).json({ tickets, total, page, totalPages: Math.max(Math.ceil(total / limit), 1) });
      } catch (err) {
        console.error('GET /api/tickets error', err);
        return res.status(500).json({ error: 'Failed to fetch tickets' });
      }
    }

    if (req.method === "POST") {
      try {
        const { title, description, priority, companyId, contactId, status } = req.body || {};
        if (!title || !description) return res.status(400).json({ error: 'title and description are required' });

        const data: any = {
          title: String(title),
          description: String(description),
          priority: priority || 'medium',
          status: status || 'open',
        };

        if (companyId) data.company = { connect: { id: String(companyId) } };
        if (contactId) data.contact = { connect: { id: String(contactId) } };

        const ticket = await prisma.ticket.create({ data });
        return res.status(201).json(ticket);
      } catch (err) {
        console.error('POST /api/tickets error', err);
        return res.status(500).json({ error: 'Failed to create ticket' });
      }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  });
}
