// pages/api/companies.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case "GET": {
        const { page = "1", pageSize = "10", search = "" } = req.query;
        const skip = (parseInt(page as string) - 1) * parseInt(pageSize as string);
        const take = parseInt(pageSize as string);

        const where = search
          ? {
              OR: [
                { name: { contains: search as string, mode: "insensitive" } },
                { industry: { contains: search as string, mode: "insensitive" } },
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
        const { name, industry, website } = req.body;

        if (!name) {
          return res.status(400).json({ error: "Company name is required" });
        }

        const company = await prisma.company.create({
          data: { name, industry, website },
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
}
