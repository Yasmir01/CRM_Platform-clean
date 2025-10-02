import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const logs = await prisma.imprLog.findMany({
      orderBy: { startedAt: "desc" },
      take: 100,
      include: {
        superAdmin: { select: { id: true, name: true, email: true } },
        subscriber: { select: { id: true, name: true } },
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
