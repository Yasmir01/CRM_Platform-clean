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
  if (!['ADMIN','SUPER_ADMIN'].includes(role)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const q = (req && (req as any).query) || {} as any;
    const scope = (q.scope as string) || undefined; // global | plan | property
    const propertyId = (q.propertyId as string) || undefined;
    const planId = (q.planId as string) || undefined;

    const where = scope === 'property'
      ? { propertyId, subscriptionPlanId: null }
      : scope === 'plan'
      ? { subscriptionPlanId: planId, propertyId: null }
      : { propertyId: null, subscriptionPlanId: null };

    const items = await prisma.escalationMatrix.findMany({
      where,
      include: { property: { select: { id: true, address: true } }, subscriptionPlan: { select: { id: true, name: true } } },
      orderBy: [{ level: 'asc' }, { createdAt: 'asc' }],
    });
    return res.status(200).json(items);
  } catch (e: any) {
    console.error('escalation-matrices list error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
