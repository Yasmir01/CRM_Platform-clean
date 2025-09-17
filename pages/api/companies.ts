// pages/api/companies.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      // pagination
      const page = Math.max(1, Number(req.query.page ?? 1));
      const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize ?? 10)));

      // sorting
      const sortParam = typeof req.query.sort === "string" ? req.query.sort : "createdAt:desc";
      const [sortField, sortDir] = sortParam.split(":");
      const orderBy: any = {};
      orderBy[sortField || "createdAt"] = sortDir === "asc" ? "asc" : "desc";

      // search
      const search = typeof req.query.search === "string" ? req.query.search.trim() : null;
      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search, mode: "insensitive" } },
        ];
      }

      const [items, total] = await Promise.all([
        prisma.company.findMany({
          where,
          orderBy,
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.company.count({ where }),
      ]);

      return res.status(200).json({ items, total, page, pageSize });
    }

    if (req.method === "POST") {
      const { name, email, phone } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Company name is required" });
      }
      const company = await prisma.company.create({
        data: { name, email, phone },
      });
      return res.status(201).json(company);
    }

    if (req.method === "PATCH") {
      const { id, ...updates } = req.body;
      if (!id) {
        return res.status(400).json({ error: "Company ID is required" });
      }
      const company = await prisma.company.update({
        where: { id },
        data: updates,
      });
      return res.status(200).json(company);
    }

    if (req.method === "DELETE") {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: "Company ID is required" });
      }
      await prisma.company.delete({ where: { id } });
      return res.status(204).end();
    }

    res.setHeader("Allow", ["GET", "POST", "PATCH", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: any) {
    console.error("API /api/companies error:", err);
    return res.status(500).json({ error: err.message ?? "Internal error" });
  } finally {
    // disconnect prisma to avoid open handles in serverless build environments
    await prisma.$disconnect();
  }
}
