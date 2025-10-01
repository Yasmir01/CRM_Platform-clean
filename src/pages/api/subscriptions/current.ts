import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../api/_db";
import { getSession } from "../../../lib/auth";

function getPlanForTier(tier: string) {
  const base = [
    { id: 'f-basic-crm', featureKey: 'basic-crm', enabled: true },
    { id: 'f-email-support', featureKey: 'email-support', enabled: true },
  ];
  const advanced = [
    { id: 'f-analytics', featureKey: 'advanced-analytics', enabled: true },
    { id: 'f-branding', featureKey: 'custom-branding', enabled: true },
  ];
  const pro = [
    { id: 'f-api', featureKey: 'api-access', enabled: true },
    { id: 'f-priority', featureKey: 'priority-support', enabled: true },
  ];
  const enterprise = [
    { id: 'f-sso', featureKey: 'sso-saml', enabled: true },
    { id: 'f-multi', featureKey: 'multi-tenant', enabled: true },
  ];

  const map: Record<string, { price: number; features: { id: string; featureKey: string; enabled: boolean }[] }> = {
    FREE: { price: 0, features: base },
    BASIC: { price: 29, features: [...base, ...advanced.map(f => ({ ...f, enabled: false }))] },
    PREMIUM: { price: 99, features: [...base, ...advanced, ...pro] },
    ENTERPRISE: { price: 299, features: [...base, ...advanced, ...pro, ...enterprise] },
  };

  const t = tier?.toUpperCase() || 'FREE';
  const cfg = map[t] || map.FREE;
  return {
    id: `plan-${t.toLowerCase()}`,
    name: t.charAt(0) + t.slice(1).toLowerCase(),
    price: cfg.price,
    billingCycle: 'monthly',
    features: cfg.features,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const session = await getSession((req as any));
    if (!session?.user?.email) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user?.orgId) return res.status(200).json(null);

    const sub = await prisma.subscription.findFirst({
      where: { orgId: user.orgId, active: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!sub) return res.status(200).json(null);

    const plan = getPlanForTier(String(sub.plan));
    const end = sub.endDate ?? new Date(new Date().setMonth(new Date().getMonth() + 1));

    return res.status(200).json({
      id: sub.id,
      plan,
      status: sub.active ? 'active' : 'inactive',
      currentPeriodEnd: end.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching current subscription:', error);
    return res.status(500).json({ error: 'Failed to fetch subscription' });
  }
}
