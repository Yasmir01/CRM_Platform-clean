import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = getUserOr401(req, res);
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (!['TENANT','ADMIN','SUPER_ADMIN','MANAGER','OWNER'].includes(role)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const q = (req && (req.query || {})) as any;
    const propertyId = (q.propertyId as string) || undefined;
    const planIdParam = (q.planId as string) || undefined;

    // Derive subscription planId from user's org plan name if not provided
    let planId: string | undefined = planIdParam;
    const orgId = (user as any).orgId as string | undefined;
    if (!planId && orgId) {
      const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { plan: true } });
      if (org?.plan) {
        const plan = await prisma.subscriptionPlan.findFirst({ where: { name: org.plan }, select: { id: true } });
        if (plan) planId = plan.id;
      }
    }

    const gateways = await prisma.paymentGateway.findMany({
      where: {
        enabled: true,
        OR: [
          { global: true },
          propertyId ? { propertyId } : { id: '__ignore__' },
          planId ? { subscriptionPlanId: planId } : { id: '__ignore__' },
        ],
      },
      select: { id: true, name: true, config: true },
      orderBy: { createdAt: 'desc' },
    });

    const sanitized = gateways.map((g) => ({
      id: g.id,
      name: g.name,
      supportsAutopay: Boolean((g as any).config?.supportsAutopay),
    }));

    return res.status(200).json(sanitized);
  } catch (e: any) {
    console.error('tenant gateways error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
