import { NextResponse } from 'next/server';
import { prisma } from '../../../../../api/_db';
import { getSession } from '../../../../lib/auth';

function getPlanForTier(tier: string) {
  // Pricing and features mapping by tier
  const baseFeatures = [
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
    FREE: { price: 0, features: baseFeatures },
    BASIC: { price: 29, features: [...baseFeatures, ...advanced.map(f => ({ ...f, enabled: false }))] },
    PREMIUM: { price: 99, features: [...baseFeatures, ...advanced, ...pro] },
    ENTERPRISE: { price: 299, features: [...baseFeatures, ...advanced, ...pro, ...enterprise] },
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

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user?.orgId) {
      // Return null so the client shows "No active subscription" gracefully
      return NextResponse.json(null);
    }

    const sub = await prisma.subscription.findFirst({
      where: { orgId: user.orgId, active: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!sub) {
      return NextResponse.json(null);
    }

    const plan = getPlanForTier(String(sub.plan));
    const end = sub.endDate ?? new Date(new Date().setMonth(new Date().getMonth() + 1));

    const response = {
      id: sub.id,
      plan,
      status: sub.active ? 'active' : 'inactive',
      currentPeriodEnd: end.toISOString(),
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('Subscription fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
