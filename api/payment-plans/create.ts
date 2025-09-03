import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method Not Allowed' }); }
  const auth = getUserOr401(req, res); if (!auth) return;
  const userId = String((auth as any).sub || (auth as any).id);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  if (!['ADMIN','MANAGER','SUPER_ADMIN'].includes(user.role as any)) return res.status(403).json({ error: 'forbidden' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const { tenantId, leaseId, title, total, schedule } = body as { tenantId: string; leaseId: string; title: string; total: number; schedule: Array<{ dueDate: string; amount: number }> };
  if (!tenantId || !leaseId || !title || !Array.isArray(schedule) || !schedule.length) return res.status(400).json({ error: 'invalid input' });

  const plan = await prisma.paymentPlan.create({
    data: {
      orgId: user.orgId,
      tenantId, leaseId, title, total: Number(total || 0),
      installments: { create: schedule.map((i) => ({ dueDate: new Date(i.dueDate), amount: Number(i.amount || 0) })) },
    },
    include: { installments: true },
  });
  return res.status(200).json(plan);
}
