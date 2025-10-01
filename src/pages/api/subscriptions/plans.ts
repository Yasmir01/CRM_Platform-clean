import type { NextApiRequest, NextApiResponse } from "next";

// In this codebase, plans are not stored in Prisma (no SubscriptionPlan model).
// We expose a static catalog consistent with app router endpoint.
const plans = [
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    return res.status(200).json(plans);
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return res.status(500).json({ error: "Failed to fetch plans" });
  }
}
