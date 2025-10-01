import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../api/_db";
import { getSession } from "../../../lib/auth";

function tierPlans() {
  return [
    {
      id: "FREE",
      name: "Free",
      price: 0,
      billingCycle: "monthly",
      features: [
        { id: "t-basic", featureKey: "basic-crm", enabled: true },
        { id: "t-props-1", featureKey: "1-property", enabled: true },
      ],
    },
    {
      id: "BASIC",
      name: "Basic",
      price: 29,
      billingCycle: "monthly",
      features: [
        { id: "t-crm", featureKey: "basic-crm", enabled: true },
        { id: "t-props-10", featureKey: "up-to-10-properties", enabled: true },
        { id: "t-email", featureKey: "email-support", enabled: true },
      ],
    },
    {
      id: "PREMIUM",
      name: "Premium",
      price: 99,
      billingCycle: "monthly",
      features: [
        { id: "t-unlimited", featureKey: "unlimited-properties", enabled: true },
        { id: "t-priority", featureKey: "priority-support", enabled: true },
        { id: "t-api", featureKey: "api-access", enabled: true },
      ],
    },
    {
      id: "ENTERPRISE",
      name: "Enterprise",
      price: 299,
      billingCycle: "monthly",
      features: [
        { id: "t-sla", featureKey: "custom-sla", enabled: true },
        { id: "t-dedicated", featureKey: "dedicated-support", enabled: true },
        { id: "t-sso", featureKey: "sso-saml", enabled: true },
      ],
    },
  ];
}

function planCatalogFallback() {
  return [
    {
      id: "starter",
      name: "Starter",
      price: 29,
      billingCycle: "monthly",
      features: [
        { id: "f-basic-crm", featureKey: "basic-crm", enabled: true },
        { id: "f-email-support", featureKey: "email-support", enabled: true },
        { id: "f-analytics", featureKey: "advanced-analytics", enabled: false },
        { id: "f-api", featureKey: "api-access", enabled: false },
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: 99,
      billingCycle: "monthly",
      features: [
        { id: "f-basic-crm", featureKey: "basic-crm", enabled: true },
        { id: "f-email-support", featureKey: "email-support", enabled: true },
        { id: "f-analytics", featureKey: "advanced-analytics", enabled: true },
        { id: "f-api", featureKey: "api-access", enabled: true },
        { id: "f-priority", featureKey: "priority-support", enabled: true },
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 299,
      billingCycle: "monthly",
      features: [
        { id: "f-basic-crm", featureKey: "basic-crm", enabled: true },
        { id: "f-email-support", featureKey: "email-support", enabled: true },
        { id: "f-analytics", featureKey: "advanced-analytics", enabled: true },
        { id: "f-api", featureKey: "api-access", enabled: true },
        { id: "f-priority", featureKey: "priority-support", enabled: true },
        { id: "f-sso", featureKey: "sso-saml", enabled: true },
        { id: "f-multi", featureKey: "multi-tenant", enabled: true },
      ],
    },
  ];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    const session = await getSession((req as any));
    const email = session?.user?.email as string | undefined;
    if (!email) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.orgId) return res.status(404).json({ error: "Organization not found" });

    const org = await prisma.organization.findUnique({ where: { id: user.orgId }, select: { tier: true, subscriptionMode: true } });
    const orgMode = (org as any)?.subscriptionMode;

    if (orgMode === "PLAN") {
      try {
        // If a SubscriptionPlan model exists, prefer it. Otherwise fallback to static.
        const plans = (await (prisma as any).subscriptionPlan?.findMany?.({ include: { features: true }, orderBy: { price: "asc" } })) || planCatalogFallback();
        return res.status(200).json(plans);
      } catch (_) {
        return res.status(200).json(planCatalogFallback());
      }
    }

    // Default to TIER mode
    return res.status(200).json(tierPlans());
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return res.status(500).json({ error: "Failed to fetch plans" });
  }
}
