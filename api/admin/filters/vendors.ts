import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../../_db';
import { ensurePermission } from '../../../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const adminUser = await prisma.user.findUnique({ where: { id: String((user as any).sub || (user as any).id) } });
    const where: any = { role: 'VENDOR' };
    if (role !== 'SUPER_ADMIN' && adminUser?.orgId) where.orgId = adminUser.orgId;

    const vendors = await prisma.user.findMany({ where, select: { id: true, name: true, email: true }, orderBy: { name: 'asc' }, take: 1000 });
    const items = vendors.map(v => ({ id: v.id, name: v.name || v.email || 'Vendor' }));
    return res.status(200).json(items);
  } catch (e: any) {
    console.error('filters vendors error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
