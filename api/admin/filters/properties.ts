import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
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
    // Property schema has address (no name). Return address as name for UI.
    const props = await prisma.property.findMany({ select: { id: true, address: true }, orderBy: { address: 'asc' }, take: 2000 });
    const items = props.map(p => ({ id: p.id, name: p.address }));
    return res.status(200).json(items);
  } catch (e: any) {
    console.error('filters properties error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
