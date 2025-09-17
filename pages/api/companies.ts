// pages/api/companies.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const { page = "1", pageSize = "10", search = "" } = req.query;

      const skip = (parseInt(page as string) - 1) * parseInt(pageSize as string);
      const take = parseInt(pageSize as string);

      const where = search
        ? {
            OR: [
              { name: { contains: search as string, mode: "insensitive" } },
              { email: { contains: search as string, mode: "insensitive" } },
              { phone: { contains: search as string, mode: "insensitive" } },
            ],
          }
        : {};

      const [companies, total] = await Promise.all([
        prisma.company.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: "desc" },
        }),
        prisma.company.count({ where }),
      ]);

      return res.status(200).json({ data: companies, total });
    }

    if (req.method === "POST") {
      const { name, email, phone } = req.body;

      const company = await prisma.company.create({
        data: { name, email, phone },
      });

      return res.status(201).json(company);
    }

    if (req.method === "PUT") {
      const { id, name, email, phone } = req.body;

      const company = await prisma.company.update({
        where: { id },
        data: { name, email, phone },
      });

      return res.status(200).json(company);
    }

    if (req.method === "DELETE") {
      const { id } = req.body;

      await prisma.company.delete({
        where: { id },
      });

      return res.status(204).end();
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
