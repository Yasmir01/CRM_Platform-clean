<<<<<<< HEAD
import type { NextApiRequest, NextApiResponse } from 'next';
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
        const { companyId, firstName, lastName, email, phone, ownerId } = req.body || {};
        if (!companyId || !firstName || !email) {
          return res.status(400).json({ error: 'companyId, firstName and email are required' });
        }
        try {
          const contact = await prisma.contact.create({
            data: {
              firstName: String(firstName),
              lastName: lastName ? String(lastName) : '',
              email: String(email),
              phone: phone || null,
              company: { connect: { id: String(companyId) } },
              ownerId: ownerId || undefined,
            },
          });
          return res.status(201).json(contact);
        } catch (err: any) {
          console.error('create contact error', err?.message || err);
          return res.status(500).json({ error: err?.message || 'Failed to create contact' });
        }
      }
      case 'PATCH': {
        const { id, ...updates } = req.body;
        if (!id) return res.status(400).json({ error: 'Missing id' });
        const contact = await prisma.contact.update({ where: { id }, data: updates });
        return res.status(200).json(contact);
      }
      case 'DELETE': {
        const id = String(req.query?.id || (req.body && (req.body.id || req.body)) || '');
        if (!id) return res.status(400).json({ error: 'Missing id' });
        await prisma.contact.delete({ where: { id } });
        return res.status(204).end();
      }
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err: any) {
    console.error('pages/api/contacts error', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
=======
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
        const limit = Math.max(parseInt((req.query.limit as string) || "10", 10), 1);
        const skip = (page - 1) * limit;

        const sortBy = String(req.query.sortBy || "createdAt");
        const order = String(req.query.order || "desc").toLowerCase() === "asc" ? "asc" : "desc";

        // Map allowed sort fields to prisma orderBy
        const scalarFields = new Set(["firstName", "lastName", "email", "createdAt", "companyId"]);

        let orderBy: any = { createdAt: order };

        if (sortBy === "name") {
          orderBy = [{ firstName: order }, { lastName: order }];
        } else if (sortBy === "company" || sortBy === "companyId") {
          orderBy = { company: { name: order } };
        } else if (scalarFields.has(sortBy)) {
          orderBy = { [sortBy]: order };
        } else {
          // fallback
          orderBy = { createdAt: order };
        }

        const [contacts, total] = await Promise.all([
          prisma.contact.findMany({
            skip,
            take: limit,
            include: { company: true },
            orderBy,
          }),
          prisma.contact.count(),
        ]);

        return res.status(200).json({
          contacts,
          total,
          page,
          totalPages: Math.max(Math.ceil(total / limit), 1),
        });
      } catch (err) {
        console.error('GET /api/contacts error', err);
        return res.status(500).json({ error: "Failed to fetch contacts" });
      }
    } else if (req.method === "POST") {
      try {
        const { name, firstName, lastName, email, companyId, phone } = req.body || {};

        let fName = firstName;
        let lName = lastName;

        if (!fName && name) {
          const parts = String(name).trim().split(/\s+/);
          fName = parts.shift() || '';
          lName = parts.join(' ') || '';
        }

        if (!fName || !email) return res.status(400).json({ error: 'firstName (or name) and email are required' });

        const data: any = {
          firstName: String(fName),
          lastName: lName ? String(lName) : '',
          email: String(email),
          phone: phone || null,
        };

        if (companyId) data.company = { connect: { id: String(companyId) } };

        const newContact = await prisma.contact.create({ data });
        return res.status(201).json(newContact);
      } catch (err) {
        console.error('POST /api/contacts error', err);
        return res.status(500).json({ error: "Failed to create contact" });
      }
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  });
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
}
