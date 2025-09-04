import { prisma } from '../_db';
import { ensurePermission } from '../../src/lib/authorize';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (!['ADMIN','SUPER_ADMIN'].includes(role)) return res.status(403).json({ error: 'Forbidden' });

  try {
    const props = await prisma.property.findMany({ orderBy: { updatedAt: 'desc' } });
    const items = props.map((p) => ({ id: p.id, name: p.address }));
    return res.status(200).json(items);
  } catch (e: any) {
    console.error('admin/properties GET error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
