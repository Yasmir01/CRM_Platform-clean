import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../../_db';
import { ensurePermission } from '../../../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) return res.status(403).json({ error: 'Forbidden' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const ids: string[] = Array.isArray(body.ids) ? body.ids.map((s: any) => String(s)) : [];
    const isActive = Boolean(body.isActive);
    if (!ids.length) return res.status(400).json({ error: 'No ids provided' });

    await prisma.lateFeeRule.updateMany({ where: { id: { in: ids } }, data: { isActive } });
    const updated = await prisma.lateFeeRule.findMany({ where: { id: { in: ids } } });
    return res.status(200).json(updated);
  } catch (e: any) {
    console.error('latefees/rules bulk-toggle error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
