import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';
import { differenceInHours } from 'date-fns';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const auth = getUserOr401(req, res);
  if (!auth) return;
  const userId = String((auth as any).sub || (auth as any).id);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ error: 'unauthorized' });

  const isSuper = user.role === 'SUPER_ADMIN';
  const isOrgAdmin = ['ADMIN','MANAGER','OWNER'].includes(user.role as any);

  if (!isSuper && !isOrgAdmin) {
    return res.status(403).json({ error: 'forbidden' });
  }

  const where: any = {};
  if (!isSuper) where.orgId = user.orgId;

  const requests = await prisma.maintenanceRequest.findMany({ where, orderBy: { createdAt: 'desc' } });

  const total = requests.length;
  const byStatus: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  const resolutionTimes: number[] = [];

  for (const r of requests) {
    byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    byPriority[r.priority] = (byPriority[r.priority] || 0) + 1;
    if (r.status === 'completed' || r.status === 'closed') {
      try {
        const hours = differenceInHours(new Date(r.updatedAt), new Date(r.createdAt));
        if (Number.isFinite(hours)) resolutionTimes.push(hours);
      } catch {}
    }
  }

  const avgResolution = resolutionTimes.length
    ? Number((resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length).toFixed(1))
    : null;

  return res.status(200).json({ total, byStatus, byPriority, avgResolution });
}
