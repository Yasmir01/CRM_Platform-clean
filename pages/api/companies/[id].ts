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
          let { name, industry, website, email, phone, address } = req.body || {};

          if (name && typeof name === 'string') name = name.trim();
          if (industry && typeof industry === 'string') industry = industry.trim();
          if (email && typeof email === 'string') email = email.trim();
          if (phone && typeof phone === 'string') phone = phone.trim();
          if (address && typeof address === 'string') address = address.trim();
          if (website && typeof website === 'string') website = website.trim();

          if (email && !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
          }

          if (phone && !/^[0-9+()\-\s]+$/.test(phone)) {
            return res.status(400).json({ error: 'Invalid phone number' });
          }

          if (website) {
            try {
              const url = new URL(website.startsWith('http') ? website : `https://${website}`);
              website = url.toString();
            } catch (e) {
              return res.status(400).json({ error: 'Invalid website URL' });
            }
          }

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
