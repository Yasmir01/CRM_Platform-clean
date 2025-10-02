import { NextResponse } from 'next/server';
import { prisma } from '../../../../../api/_db';
import { getSession } from '../../../../lib/auth';

const PLAN_TO_TIER: Record<string, 'BASIC' | 'PREMIUM' | 'ENTERPRISE'> = {
  starter: 'BASIC',
  pro: 'PREMIUM',
  enterprise: 'ENTERPRISE',
};

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const planId = String(body?.planId || '').toLowerCase();
    const tier = PLAN_TO_TIER[planId];
    if (!tier) return NextResponse.json({ error: 'Invalid planId' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user?.orgId) return NextResponse.json({ error: 'No organization found' }, { status: 404 });

    // Deactivate existing active subs
    await prisma.subscription.updateMany({
      where: { orgId: user.orgId, active: true },
      data: { active: false, endDate: new Date() },
    });

    // Create new active subscription
    const created = await prisma.subscription.create({
      data: {
        orgId: user.orgId,
        plan: tier as any,
        active: true,
        startDate: new Date(),
      },
    });

    return NextResponse.json({ ok: true, id: created.id });
  } catch (err) {
    console.error('Subscription upgrade error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
