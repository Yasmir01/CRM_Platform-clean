import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../api/_db";
import { getSession } from "../../../lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { orgId: bodyOrgId } = req.body || {};

    let orgId = bodyOrgId as string | undefined;
    if (!orgId) {
      const session = await getSession((req as any));
      const email = session?.user?.email as string | undefined;
      if (!email) return res.status(401).json({ error: "Unauthorized" });
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.orgId) return res.status(404).json({ error: "No organization found" });
      orgId = user.orgId;
    }

    const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { subscriptionMode: true } });
    const mode = (org?.subscriptionMode || 'TIER') as 'TIER' | 'PLAN';

    if (mode === 'PLAN') {
      await prisma.organizationSubscription.updateMany({
        where: { orgId, status: 'active' },
        data: { status: 'canceled', canceledAt: new Date() },
      });
      return res.status(200).json({ success: true, mode });
    }

    // TIER mode: downgrade to FREE and end active paid subscriptions
    await prisma.organization.update({ where: { id: orgId }, data: { tier: 'FREE' as any } });
    await prisma.subscription.updateMany({ where: { orgId, active: true }, data: { active: false, endDate: new Date() } });

    return res.status(200).json({ success: true, mode });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return res.status(500).json({ error: "Failed to cancel subscription" });
  }
}
