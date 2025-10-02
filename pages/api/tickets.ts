import type { NextApiRequest, NextApiResponse } from "next";
import prisma from '@/lib/prisma';
import { getUserOr401 } from '@/utils/authz';
import { runWithRequestSession } from '@/lib/runWithRequestSession';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserOr401(req as any, res as any);
  if (!user) return;

  return runWithRequestSession(req as any, async () => {
    try {
      if (req.method === "GET") {
        // Support optional pagination/search or return all when not provided
        const page = req.query.page ? Math.max(parseInt((req.query.page as string) || "1", 10), 1) : null;
        const limit = req.query.pageSize ? Math.max(parseInt((req.query.pageSize as string) || "10", 10), 1) : null;
        const skip = page && limit ? (page - 1) * limit : undefined;

        const search = String(req.query.search || "").trim();
        const where: any = {};
        if (search) {
          where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ];
        }

        const findOptions: any = {
          where,
          include: { company: true, contact: true },
          orderBy: { createdAt: 'desc' },
        };

        if (skip !== undefined && limit) {
          findOptions.skip = skip;
          findOptions.take = limit;
        }

        const [tickets, total] = await Promise.all([
          prisma.ticket.findMany(findOptions),
          prisma.ticket.count({ where }),
        ]);

        return res.status(200).json({ tickets, total, page: page ?? 1, totalPages: Math.max(Math.ceil((total || 0) / (limit || total || 1)), 1) });
      }

      if (req.method === "POST") {
        const { title, description, priority, status, companyId, contactId } = req.body || {};
        if (!title) return res.status(400).json({ error: 'Title is required' });

        const data: any = {
          title: String(title),
          description: description === undefined ? null : String(description),
          priority: priority || undefined,
          status: status || undefined,
        };

        if (companyId !== undefined) data.companyId = companyId || null;
        if (contactId !== undefined) data.contactId = contactId || null;

        const newTicket = await prisma.ticket.create({ data });
        return res.status(201).json(newTicket);
      }

      if (req.method === "PUT") {
        const { id, ...updates } = req.body || {};
        if (!id) return res.status(400).json({ error: 'ID is required' });

        const data: any = {};
        if (updates.title !== undefined) data.title = String(updates.title);
        if (updates.description !== undefined) data.description = updates.description === null ? null : String(updates.description);
        if (updates.priority !== undefined) data.priority = updates.priority;
        if (updates.status !== undefined) data.status = updates.status;
        if (updates.companyId !== undefined) data.companyId = updates.companyId || null;
        if (updates.contactId !== undefined) data.contactId = updates.contactId || null;

        const updatedTicket = await prisma.ticket.update({ where: { id: String(id) }, data });
        return res.status(200).json(updatedTicket);
      }

      if (req.method === "DELETE") {
        const { id } = req.body || {};
        if (!id) return res.status(400).json({ error: 'ID is required' });

        await prisma.ticket.delete({ where: { id: String(id) } });
        return res.status(204).end();
      }

      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (err: any) {
      console.error('Tickets API error', err);
      return res.status(500).json({ error: err?.message || 'Server error' });
    }
  });
}
