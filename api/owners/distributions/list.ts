import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../../src/utils/authz';
import { prisma } from '../../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    const q = (req.query || {}) as any;
    const ownerId = q.ownerId ? String(q.ownerId) : undefined;
    const where: any = {};
    if (ownerId) where.ownerId = ownerId;

    const dists = await prisma.ownerDistribution.findMany({ where, orderBy: { date: 'desc' }, include: { owner: true, property: true } as any });
    return res.status(200).json(dists);
  } catch (e: any) {
    console.error('owners/distributions/list error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
