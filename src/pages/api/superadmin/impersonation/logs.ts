import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { status, from, to } = req.query as { status?: string | string[]; from?: string | string[]; to?: string | string[] };

    const where: any = {};
    const statusVal = Array.isArray(status) ? status[0] : status;
    if (statusVal === "active") where.endedAt = null;
    if (statusVal === "closed") where.endedAt = { not: null };

    const fromVal = Array.isArray(from) ? from[0] : from;
    const toVal = Array.isArray(to) ? to[0] : to;
    if (fromVal || toVal) {
      where.startedAt = {} as any;
      if (fromVal) {
        const d = new Date(fromVal);
        if (!isNaN(d.getTime())) where.startedAt.gte = d;
      }
      if (toVal) {
        const d = new Date(toVal);
        if (!isNaN(d.getTime())) where.startedAt.lte = d;
      }
    }

    const logs = await prisma.imprLog.findMany({
      where,
      orderBy: { startedAt: "desc" },
      take: 100,
      include: {
        superAdmin: { select: { name: true, email: true } },
        subscriber: { select: { name: true } },
      },
    });

    const shaped = logs.map((log: any) => ({
      id: log.id,
      orgName: log.subscriber?.name,
      orgId: log.subscriberId,
      superAdmin: log.superAdmin?.name || "Unknown",
      superAdminEmail: log.superAdmin?.email,
      startedAt: log.startedAt,
      endedAt: log.endedAt,
      alertSent: log.alertSent,
    }));

    return res.status(200).json(shaped);
  } catch (error) {
    console.error("Error loading impersonation logs:", error);
    return res.status(500).json({ error: "Failed to load impersonation logs" });
  }
}
