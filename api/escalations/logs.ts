import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { ensurePermission } from '../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (!['ADMIN','SUPER_ADMIN'].includes(role)) return res.status(403).json({ error: 'Forbidden' });

  try {
    const q = (req && (req.query || {})) as any;
    const propertyId = (q.propertyId as string) || undefined;
    const planId = (q.planId as string) || undefined;
    const requestId = (q.requestId as string) || undefined;

    // Build where clause
    const where: any = {};
    if (requestId) where.requestId = requestId;

    // Nested filters on related request
    const requestWhere: any = {};
    if (propertyId) requestWhere.propertyId = propertyId;

    // Plan filter via org.plan name
    if (planId) {
      const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId }, select: { name: true } });
      if (plan?.name) {
        const orgs = await prisma.organization.findMany({ where: { plan: plan.name }, select: { id: true } });
        const orgIds = orgs.map((o) => o.id);
        requestWhere.orgId = orgIds.length ? { in: orgIds } : '__none__';
      }
    }

    if (Object.keys(requestWhere).length) where.request = requestWhere;

    const logs = await prisma.escalationLog.findMany({
      where,
      include: {
        request: {
          select: {
            id: true,
            title: true,
            status: true,
            orgId: true,
            property: { select: { id: true, address: true } },
          },
        },
      },
      orderBy: { triggeredAt: 'desc' },
      take: 1000,
    });

    return res.status(200).json(logs);
  } catch (e: any) {
    console.error('escalations logs error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
