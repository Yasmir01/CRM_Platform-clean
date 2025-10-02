import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { orgId } = req.body as { orgId?: string };
    if (!orgId) {
      return res.status(400).json({ error: "Missing orgId" });
    }

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, subscriptionMode: true },
    });

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    if (org.subscriptionMode === "TIER") {
      const updated = await prisma.organization.update({
        where: { id: orgId },
        data: { tier: "FREE" },
      });

      return res.status(200).json({
        success: true,
        mode: "TIER",
        updated,
      });
    }

    if (org.subscriptionMode === "PLAN") {
      const updated = await prisma.organizationSubscription.updateMany({
        where: { orgId, status: "active" },
        data: { status: "canceled" },
      });

      return res.status(200).json({
        success: true,
        mode: "PLAN",
        updated,
      });
    }

    return res.status(400).json({ error: "Unknown subscription mode" });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return res.status(500).json({ error: "Failed to cancel subscription" });
  }
}
