import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const SECRET = process.env.IMPERS_SECRET || "supersecret";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { superAdminId, targetOrgId } = (req.body || {}) as { superAdminId?: string; targetOrgId?: string };

    if (!superAdminId || !targetOrgId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const superAdmin = await prisma.user.findUnique({ where: { id: superAdminId }, select: { role: true } });
    if (!superAdmin || String(superAdmin.role) !== "SUPERADMIN") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const log = await prisma.imprLog.create({
      data: {
        superAdminId,
        subscriberId: targetOrgId,
        startedAt: new Date(),
      },
    });

    const token = jwt.sign({ sub: superAdminId, org: targetOrgId, logId: log.id }, SECRET, { expiresIn: "15m" });

    return res.status(200).json({ token, logId: log.id });
  } catch (error) {
    console.error("Error impersonating:", error);
    return res.status(500).json({ error: "Failed to impersonate" });
  }
}
