import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { ensurePermission } from '../../../src/lib/authorize';

const ALLOWED = new Set(['PENDING', 'APPLIED', 'WAIVED']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) return res.status(403).json({ error: 'Forbidden' });

  const id = String((req.query?.id as string) || '');
  if (!id) return res.status(400).json({ error: 'Missing id' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const status = String(body.status || '').toUpperCase();
    if (!ALLOWED.has(status)) return res.status(400).json({ error: 'Invalid status' });

    const waivedBy = body.waivedBy ? String(body.waivedBy) : (status === 'WAIVED' ? String((user as any).sub || (user as any).id) : null);

    const updated = await prisma.lateFee.update({
      where: { id },
      data: {
        status,
        waivedBy: status === 'WAIVED' ? waivedBy : null,
        appliedAt: status === 'APPLIED' ? new Date() : null,
      },
    });

    return res.status(200).json(updated);
  } catch (e: any) {
    console.error('admin/latefees PATCH error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
