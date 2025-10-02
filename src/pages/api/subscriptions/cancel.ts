import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { getSession } from "../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Allow orgId from body, else derive from session
    let { orgId } = (req.body || {}) as { orgId?: string };
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

    // Cancel active PLAN subscriptions
    const updatedPlanSubs = await prisma.organizationSubscription.updateMany({
      where: { orgId, status: "active" },
      data: { status: "canceled" },
    });

    if (updatedPlanSubs.count > 0) {
      return res.status(200).json({
        success: true,
        mode: "PLAN",
        updated: updatedPlanSubs,
      });
    }

    // Otherwise fallback to TIER mode → set tier to FREE
    const updatedOrg = await prisma.organization.update({
      where: { id: orgId },
      data: { tier: "FREE" },
    });

    return res.status(200).json({
      success: true,
      mode: "TIER",
      updated: updatedOrg,
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return res.status(500).json({ error: "Failed to cancel subscription" });
  }
}
