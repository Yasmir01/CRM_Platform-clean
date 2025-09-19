import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../src/utils/authz';
import { prisma } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    const q = (req.query || {}) as any;
    const propertyId = q.propertyId ? String(q.propertyId) : undefined;
    const status = q.status ? String(q.status) : undefined;
    const where: any = {};
    if (propertyId) where.propertyId = propertyId;
    if (status) where.status = status;

    const apps = await prisma.application.findMany({ where, orderBy: { createdAt: 'desc' } });
    return res.status(200).json(apps);
  } catch (e: any) {
    console.error('applications/list error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
