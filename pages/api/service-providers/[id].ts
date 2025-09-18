import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { getUserOr401 } from "@/utils/authz";
import { runWithRequestSession } from "@/lib/runWithRequestSession";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserOr401(req as any, res as any);
  if (!user) return;

  return runWithRequestSession(req as any, async () => {
    try {
      const { id } = req.query;
      if (typeof id !== "string") return res.status(400).json({ error: "Invalid ID" });

      switch (req.method) {
        case "GET": {
          const provider = await prisma.serviceProvider.findUnique({ where: { id } });
          if (!provider) return res.status(404).json({ error: "Service provider not found" });
          return res.status(200).json(provider);
        }

        case "PUT": {
          let { name, email, phone, category, service, website, notes } = req.body || {};

          if (name && typeof name === "string") name = name.trim();
          if (email && typeof email === "string") email = email.trim();
          if (phone && typeof phone === "string") phone = phone.trim();
          category = typeof category === 'string' ? category.trim() : (typeof service === 'string' ? service.trim() : undefined);
          website = typeof website === 'string' ? website.trim() : (typeof notes === 'string' ? notes.trim() : undefined);

          if (email && !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ error: "Invalid email address" });
          }
          if (phone && !/^[0-9+()\-\s]+$/.test(phone)) {
            return res.status(400).json({ error: "Invalid phone number" });
          }

          const data: any = {};
          if (name !== undefined) data.name = name;
          if (email !== undefined) data.email = email;
          if (phone !== undefined) data.phone = phone;
          if (category !== undefined) data.category = category;
          if (website !== undefined) data.website = website;

          const updated = await prisma.serviceProvider.update({ where: { id }, data });
          return res.status(200).json(updated);
        }

        case "DELETE": {
          await prisma.serviceProvider.delete({ where: { id } });
          return res.status(204).end();
        }

        default:
          res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
          return res.status(405).end(`Method ${req.method} Not Allowed`);
      }
    } catch (error) {
      console.error("API Error (service-providers/[id]):", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
}
