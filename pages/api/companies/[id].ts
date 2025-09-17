// pages/api/companies/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { getUserOr401 } from "@/utils/authz";
import { runWithRequestSession } from "@/lib/runWithRequestSession";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserOr401(req as any, res as any);
  if (!user) return;

  return runWithRequestSession(req as any, async () => {
    const { id } = req.query;

    if (typeof id !== "string") {
      return res.status(400).json({ error: "Invalid ID" });
    }

    try {
      switch (req.method) {
        case "GET": {
          const company = await prisma.company.findUnique({ where: { id: id as string } });
          if (!company) return res.status(404).json({ error: "Company not found" });
          return res.status(200).json(company);
        }

        case "PUT": {
          const { name, industry, website, email, phone, address } = req.body;
          const updated = await prisma.company.update({
            where: { id: id as string },
            data: { name, industry, website, email, phone, address },
          });
          return res.status(200).json(updated);
        }

        case "DELETE": {
          await prisma.company.delete({ where: { id: id as string } });
          return res.status(204).end();
        }

        default:
          res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
          return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    } catch (error) {
      console.error("API Error (companies/[id]):", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
}
