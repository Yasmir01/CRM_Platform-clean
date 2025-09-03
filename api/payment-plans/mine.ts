import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Method Not Allowed' }); }
  const auth = getUserOr401(req, res); if (!auth) return;
  const tenantId = String((auth as any).sub || (auth as any).id);
  const plans = await prisma.paymentPlan.findMany({ where: { tenantId, status: { in: ['active', 'late'] } }, include: { installments: { orderBy: { dueDate: 'asc' } } } });
  return res.status(200).json(plans);
}
