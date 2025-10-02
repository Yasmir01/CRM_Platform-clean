import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getSession } from "../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Prefer explicit orgId from query, else fall back to session-derived orgId
    let orgId = (req.query.orgId as string) || undefined;
    if (!orgId) {
      const session = await getSession((req as any));
      const email = session?.user?.email as string | undefined;
      if (email) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user?.orgId) orgId = user.orgId;
      }
    }

    if (!orgId) {
      return res.status(400).json({ error: "Missing orgId" });
    }

    // Try Plan-mode (OrganizationSubscription) first
    const subscription = await prisma.organizationSubscription.findFirst({
      where: { orgId, status: "active" },
      include: { plan: true },
    });

    if (subscription) {
      return res.status(200).json({
        orgId,
        mode: "PLAN",
        plan: subscription.plan?.name,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
      });
    }

    // Fallback: legacy Tier mode
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, tier: true },
    });

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    return res.status(200).json({
      orgId: org.id,
      mode: "TIER",
      tier: org.tier,
      status: "active",
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return res.status(500).json({ error: "Failed to load subscription" });
  }
}
