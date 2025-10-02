<<<<<<< HEAD
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
        const companies = await prisma.company.findMany({ include: { contacts: true } });
        return res.status(200).json(companies);
      }
      case 'POST': {
        const { name, domain, industry } = req.body;
        const company = await prisma.company.create({ data: { name, domain, industry } });
        return res.status(201).json(company);
      }
      case 'PATCH': {
        const { id, ...updates } = req.body;
        if (!id) return res.status(400).json({ error: 'Missing id' });
        const company = await prisma.company.update({ where: { id }, data: updates });
        return res.status(200).json(company);
      }
      case 'DELETE': {
        const { id } = req.body;
        if (!id) return res.status(400).json({ error: 'Missing id' });
        await prisma.company.delete({ where: { id } });
        return res.status(204).end();
      }
      default:
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err: any) {
    console.error('pages/api/companies error', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Server error' });
  }
=======
// pages/api/companies.ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { getUserOr401 } from "@/utils/authz";
import { runWithRequestSession } from "@/lib/runWithRequestSession";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // auth check first
  const user = getUserOr401(req as any, res as any);
  if (!user) return; // getUserOr401 already responded with 401

  return runWithRequestSession(req as any, async () => {
    try {
      switch (req.method) {
        case "GET": {
          const { page = "1", pageSize = "10", search = "" } = req.query;
          const skip = (parseInt(page as string, 10) - 1) * parseInt(pageSize as string, 10);
          const take = parseInt(pageSize as string, 10);

          const where = search
            ? {
                OR: [
                  { name: { contains: search as string, mode: "insensitive" } },
                  { industry: { contains: search as string, mode: "insensitive" } },
                  { email: { contains: search as string, mode: "insensitive" } },
                  { phone: { contains: search as string, mode: "insensitive" } },
                  { address: { contains: search as string, mode: "insensitive" } },
                ],
              }
            : {};

          const [companies, total] = await Promise.all([
            prisma.company.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
            prisma.company.count({ where }),
          ]);

          return res.status(200).json({ data: companies, total });
        }

        case "POST": {
          let { name, industry, website, email, phone, address } = req.body || {};

          if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ error: "Company name is required" });
          }

          name = name.trim();
          industry = typeof industry === 'string' ? industry.trim() : undefined;
          email = typeof email === 'string' ? email.trim() : undefined;
          phone = typeof phone === 'string' ? phone.trim() : undefined;
          address = typeof address === 'string' ? address.trim() : undefined;
          website = typeof website === 'string' ? website.trim() : undefined;

          // Basic email validation
          if (email && !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
          }

          // Basic phone validation (digits, spaces, +, -, parentheses)
          if (phone && !/^[0-9+()\-\s]+$/.test(phone)) {
            return res.status(400).json({ error: 'Invalid phone number' });
          }

          // Normalize website if present
          if (website) {
            try {
              const url = new URL(website.startsWith('http') ? website : `https://${website}`);
              website = url.toString();
            } catch (e) {
              return res.status(400).json({ error: 'Invalid website URL' });
            }
          }

          const company = await prisma.company.create({
            data: { name, industry, website, email, phone, address },
          });

          return res.status(201).json(company);
        }

        default:
          res.setHeader("Allow", ["GET", "POST"]);
          return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    } catch (error) {
      console.error("API Error (companies):", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
}
