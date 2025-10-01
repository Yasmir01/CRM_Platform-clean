import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../api/_db";
import { getSession } from "../../../lib/auth";

const PLAN_TO_TIER: Record<string, 'BASIC' | 'PREMIUM' | 'ENTERPRISE'> = {
  starter: 'BASIC',
  pro: 'PREMIUM',
  enterprise: 'ENTERPRISE',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { planId, tier: bodyTier, orgId: bodyOrgId } = req.body || {};
    if (!planId && !bodyTier && !bodyOrgId) return res.status(400).json({ error: "Missing planId/tier or orgId" });

    let orgId = bodyOrgId as string | undefined;
    if (!orgId) {
      const session = await getSession((req as any));
      const email = session?.user?.email as string | undefined;
      if (!email) return res.status(401).json({ error: "Unauthorized" });
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.orgId) return res.status(404).json({ error: "No organization found" });
      orgId = user.orgId;
    }

    // Determine desired tier based on provided inputs
    let desiredTier: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE' | undefined;
    if (bodyTier) {
      desiredTier = String(bodyTier).toUpperCase() as any;
      if (!['FREE','BASIC','PREMIUM','ENTERPRISE'].includes(desiredTier)) {
        return res.status(400).json({ error: 'Invalid tier' });
      }
    } else if (planId) {
      desiredTier = PLAN_TO_TIER[String(planId).toLowerCase()] as any;
      if (!desiredTier) return res.status(400).json({ error: 'Invalid planId' });
    }

    // Update Organization.tier to reflect the current selection (TIER compatibility)
    if (desiredTier) {
      await prisma.organization.update({ where: { id: orgId }, data: { tier: desiredTier as any } });
    }

    // Deactivate existing and create new active Subscription row
    await prisma.subscription.updateMany({ where: { orgId, active: true }, data: { active: false, endDate: new Date() } });
    const created = await prisma.subscription.create({
      data: { orgId, plan: (desiredTier || 'BASIC') as any, active: true, startDate: new Date() },
    });

    // Return mode hint for client UX — if caller sent tier -> TIER, else PLAN
    const mode = bodyTier ? 'TIER' : 'PLAN';
    return res.status(200).json({ success: true, mode, id: created.id });
  } catch (error) {
    console.error("Error upgrading subscription:", error);
    return res.status(500).json({ error: "Failed to upgrade subscription" });
  }
}
