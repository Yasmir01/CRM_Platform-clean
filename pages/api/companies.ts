import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const { page = "1", limit = "10", sortField = "createdAt", sortOrder = "asc" } = req.query as Record<string, string>;

      const pageNumber = parseInt(page, 10) || 1;
      const pageSize = parseInt(limit, 10) || 10;

      // validate sortField - allowlist to prevent unsafe dynamic fields
      const allowed = new Set(["name", "industry", "website", "createdAt"]);
      const field = allowed.has(sortField) ? sortField : "createdAt";
      const order = sortOrder === "asc" ? "asc" : "desc";

      const companies = await prisma.company.findMany({
        skip: (pageNumber - 1) * pageSize,
        take: pageSize,
        orderBy: { [field]: order },
      });

      const total = await prisma.company.count();
      const hasMore = pageNumber * pageSize < total;

      res.status(200).json({ data: companies, hasMore, total, page: pageNumber, totalPages: Math.max(Math.ceil(total / pageSize), 1) });
    } catch (err) {
      console.error("Error fetching companies:", err);
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  } else if (req.method === "POST") {
    try {
      const { name, industry, website, phone, address } = req.body || {};
      if (!name) return res.status(400).json({ error: 'name is required' });

      const newCompany = await prisma.company.create({
        data: { name: String(name), industry: industry || null, website: website || null, phone: phone || null, address: address || null },
      });

      res.status(201).json(newCompany);
    } catch (err) {
      console.error("Error creating company:", err);
      res.status(500).json({ error: "Failed to create company" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
