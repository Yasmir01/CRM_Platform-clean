import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../src/utils/authz';
import { prisma } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    const q = (req.query || {}) as any;
    const year = q.year ? Number(q.year) : undefined;
    const where: any = {};
    if (year) where.year = Number(year);
    const reports = await prisma.taxReport.findMany({ where, orderBy: { createdAt: 'desc' }, include: { landlord: true, vendor: true } as any });
    return res.status(200).json(reports);
  } catch (e: any) {
    console.error('tax-reports/list error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
