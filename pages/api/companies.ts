// pages/api/companies.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type CompanyResponse = {
  data: any[];
  total: number;
  page: number;
  pageSize: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<CompanyResponse | { error: string }>) {
  try {
    const q = req.query;

    // pagination params
    const page = Math.max(1, Number(q.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(q.pageSize ?? 10)));

    // sorting: example "name:asc" or "createdAt:desc"
    const sortParam = typeof q.sort === "string" ? q.sort : "createdAt:desc";
    const [sortField, sortDir] = sortParam.split(":");
    const orderBy: any = {};
    orderBy[sortField || "createdAt"] = sortDir === "asc" ? "asc" : "desc";

    // optional search/filter
    const search = typeof q.search === "string" && q.search.trim().length > 0 ? q.search.trim() : null;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { industry: { contains: search, mode: "insensitive" } },
      ];
    }

    const total = await prisma.company.count({ where });

    const data = await prisma.company.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        contacts: { select: { id: true, name: true, email: true } }, // optional include
        organization: { select: { id: true, name: true } },
      },
    });

    res.status(200).json({ data, total, page, pageSize });
  } catch (err: any) {
    console.error("API /api/companies error:", err);
    res.status(500).json({ error: err.message ?? "Internal error" });
  } finally {
    // don't always disconnect in serverless—ok for dev. Comment if you keep long-lived prisma instance.
    // await prisma.$disconnect();
  }
}
