import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const page = Math.max(parseInt((req.query.page as string) || "1", 10), 1);
      const limit = Math.max(parseInt((req.query.limit as string) || "10", 10), 1);
      const skip = (page - 1) * limit;

      const [contacts, total] = await Promise.all([
        prisma.contact.findMany({
          skip,
          take: limit,
          include: { company: true },
          orderBy: { createdAt: "desc" },
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
}
