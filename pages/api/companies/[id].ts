import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id?: string };
  if (!id) return res.status(400).json({ error: "Missing id" });

  try {
    if (req.method === "GET") {
      const company = await prisma.company.findUnique({ where: { id } });
      if (!company) return res.status(404).json({ error: "Not found" });
      return res.status(200).json(company);
    }

    if (req.method === "PUT" || req.method === "PATCH") {
      const { name, email, phone } = req.body;
      const updated = await prisma.company.update({ where: { id }, data: { name, email, phone } });
      return res.status(200).json(updated);
    }

    if (req.method === "DELETE") {
      await prisma.company.delete({ where: { id } });
      return res.status(204).end();
    }

    res.setHeader("Allow", ["GET", "PUT", "PATCH", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: any) {
    console.error("API /api/companies/[id] error:", err);
    return res.status(500).json({ error: err.message ?? "Internal error" });
  }
}
