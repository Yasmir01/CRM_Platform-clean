import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../../_db';
import { ensurePermission } from '../../../../src/lib/authorize';

const SCOPES = new Set(['GLOBAL', 'PROPERTY']);
const FEE_TYPES = new Set(['FIXED', 'PERCENTAGE']);

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
    const data: any = {};

    if (body.scope !== undefined) {
      const scope = String(body.scope);
      if (!SCOPES.has(scope)) return res.status(400).json({ error: 'Invalid scope' });
      data.scope = scope;
    }
    if (body.propertyId !== undefined) data.propertyId = body.propertyId ? String(body.propertyId) : null;
    if (body.gracePeriod !== undefined) {
      const g = Number(body.gracePeriod);
      if (!Number.isInteger(g) || g < 0) return res.status(400).json({ error: 'Invalid gracePeriod' });
      data.gracePeriod = g;
    }
    if (body.feeType !== undefined) {
      const t = String(body.feeType);
      if (!FEE_TYPES.has(t)) return res.status(400).json({ error: 'Invalid feeType' });
      data.feeType = t;
    }
    if (body.feeAmount !== undefined) {
      const a = Number(body.feeAmount);
      if (!Number.isFinite(a) || a < 0) return res.status(400).json({ error: 'Invalid feeAmount' });
      data.feeAmount = a;
    }
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    const updated = await prisma.lateFeeRule.update({ where: { id }, data });
    return res.status(200).json(updated);
  } catch (e: any) {
    console.error('latefees/rules [id] PATCH error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
