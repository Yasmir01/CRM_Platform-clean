import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { getUserOr401 } from "@/utils/authz";
import { runWithRequestSession } from "@/lib/runWithRequestSession";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserOr401(req as any, res as any);
  if (!user) return;

  return runWithRequestSession(req as any, async () => {
    try {
      switch (req.method) {
            case "GET": {
          const { page = "1", pageSize = "10", search = "" } = req.query as Record<string, string>;
          const skip = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);
          const take = parseInt(pageSize, 10);

          const where = search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { category: { contains: search, mode: "insensitive" } },
                ],
              }
            : {};

          const [providers, total] = await Promise.all([
            prisma.serviceProvider.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, include: { company: true } }),
            prisma.serviceProvider.count({ where }),
          ]);

          return res.status(200).json({ providers, total });
        }

        case "POST": {
          let { name, email, phone, category, service, website, notes, companyId } = req.body || {};

          if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ error: "Service provider name is required" });
          }

          name = name.trim();
          email = typeof email === "string" ? email.trim() : undefined;
          phone = typeof phone === "string" ? phone.trim() : undefined;
          category = typeof category === "string" ? category.trim() : (typeof service === 'string' ? service.trim() : undefined);
          website = typeof website === "string" ? website.trim() : (typeof notes === 'string' ? notes.trim() : undefined);
          companyId = typeof companyId === "string" ? companyId : undefined;

          if (email && !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ error: "Invalid email address" });
          }
          if (phone && !/^[0-9+()\-\s]+$/.test(phone)) {
            return res.status(400).json({ error: "Invalid phone number" });
          }

          const provider = await prisma.serviceProvider.create({
            data: { name, email, phone, category: category || '', website: website || null, companyId },
          });

          return res.status(201).json(provider);
        }

        default:
          res.setHeader("Allow", ["GET", "POST"]);
          return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    } catch (error) {
      console.error("API Error (service-providers):", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
}
