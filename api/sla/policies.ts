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
    const items = await prisma.sLAConfig.findMany({ include: { property: { select: { id: true, address: true } } }, orderBy: { category: 'asc' } });
    return res.status(200).json(items);
  } catch (e: any) {
    console.error('sla policies list error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
