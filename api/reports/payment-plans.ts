import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Method Not Allowed' }); }
  const auth = getUserOr401(req, res); if (!auth) return;
  const userId = String((auth as any).sub || (auth as any).id);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ error: 'unauthorized' });

  const where = user.role === 'SUPER_ADMIN' ? {} : { orgId: user.orgId } as any;
  const plans = await prisma.paymentPlan.findMany({ where, include: { installments: true } });

  const totalPlans = plans.length;
  const active = plans.filter((p) => p.status === 'active').length;
  const completed = plans.filter((p) => p.status === 'completed').length;
  const totalCollected = plans.reduce((sum, p) => sum + p.installments.reduce((a, i) => a + (i.paidAmount || 0), 0), 0);

  return res.status(200).json({ totalPlans, active, completed, totalCollected });
}
