import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { orgId } = req.query;
    if (!orgId || typeof orgId !== "string") {
      return res.status(400).json({ error: "Missing orgId" });
    }

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, name: true, tier: true, subscriptionMode: true },
    });

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    if (org.subscriptionMode === "TIER") {
      return res.status(200).json({
        mode: "TIER",
        plan: org.tier,
        orgId: org.id,
      });
    }

    if (org.subscriptionMode === "PLAN") {
      const activeSub = await prisma.organizationSubscription.findFirst({
        where: { orgId: org.id, status: "active" },
        include: { plan: true },
      });

      if (!activeSub) {
        return res.status(200).json({ mode: "PLAN", plan: null, orgId: org.id });
      }

      const interval = (activeSub.plan as any)?.interval || (activeSub.plan as any)?.billingCycle || "monthly";

      return res.status(200).json({
        mode: "PLAN",
        plan: activeSub.plan?.name,
        price: activeSub.plan?.price,
        interval,
        currentPeriodEnd: activeSub.currentPeriodEnd,
        orgId: org.id,
      });
    }

    return res.status(400).json({ error: "Unknown subscription mode" });
  } catch (error) {
    console.error("Error loading current subscription:", error);
    return res.status(500).json({ error: "Failed to load current subscription" });
  }
}
