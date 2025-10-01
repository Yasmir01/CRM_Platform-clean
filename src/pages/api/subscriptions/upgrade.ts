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
    const { planId, orgId: bodyOrgId } = req.body || {};
    if (!planId && !bodyOrgId) return res.status(400).json({ error: "Missing planId or orgId" });

    const tier = PLAN_TO_TIER[String(planId || '').toLowerCase()];
    if (!tier) return res.status(400).json({ error: "Invalid planId" });

    let orgId = bodyOrgId as string | undefined;
    if (!orgId) {
      const session = await getSession((req as any));
      const email = session?.user?.email as string | undefined;
      if (!email) return res.status(401).json({ error: "Unauthorized" });
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.orgId) return res.status(404).json({ error: "No organization found" });
      orgId = user.orgId;
    }

    await prisma.subscription.updateMany({ where: { orgId, active: true }, data: { active: false, endDate: new Date() } });

    const created = await prisma.subscription.create({
      data: { orgId, plan: tier as any, active: true, startDate: new Date() },
    });

    return res.status(200).json({ success: true, id: created.id });
  } catch (error) {
    console.error("Error upgrading subscription:", error);
    return res.status(500).json({ error: "Failed to upgrade subscription" });
  }
}
