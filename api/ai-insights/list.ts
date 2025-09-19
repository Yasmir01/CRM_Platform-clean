import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../src/utils/authz';
import { prisma } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    const q = (req.query || {}) as any;
    const propertyId = q.propertyId ? String(q.propertyId) : undefined;
    const where: any = { userId: (user as any).sub || (user as any).id };
    if (propertyId) where.propertyId = propertyId;

    const insights = await prisma.aIInsight.findMany({ where, orderBy: { generatedAt: 'desc' }, take: 200 });
    return res.status(200).json(insights);
  } catch (e: any) {
    console.error('ai-insights/list error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
