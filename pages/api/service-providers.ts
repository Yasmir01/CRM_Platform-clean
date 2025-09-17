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
          const providers = await prisma.serviceProvider.findMany({ orderBy: { createdAt: "desc" } });
          return res.status(200).json(providers);
        }

        case "POST": {
          let { name, email, phone, service, notes } = req.body || {};

          if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({ error: "Service provider name is required" });
          }

          name = name.trim();
          email = typeof email === "string" ? email.trim() : undefined;
          phone = typeof phone === "string" ? phone.trim() : undefined;
          service = typeof service === "string" ? service.trim() : undefined;
          notes = typeof notes === "string" ? notes.trim() : undefined;

          if (email && !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ error: "Invalid email address" });
          }
          if (phone && !/^[0-9+()\-\s]+$/.test(phone)) {
            return res.status(400).json({ error: "Invalid phone number" });
          }

          const provider = await prisma.serviceProvider.create({
            data: { name, email, phone, service, notes },
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
