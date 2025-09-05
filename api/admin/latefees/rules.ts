import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { ensurePermission } from '../../../src/lib/authorize';

const SCOPES = new Set(['GLOBAL', 'PROPERTY']);
const FEE_TYPES = new Set(['FIXED', 'PERCENTAGE']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method || 'GET';

  if (!['GET', 'POST'].includes(method)) {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) return res.status(403).json({ error: 'Forbidden' });

  try {
    if (method === 'GET') {
      const rules = await prisma.lateFeeRule.findMany({ orderBy: { createdAt: 'desc' } });
      return res.status(200).json(rules);
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const scope = String(body.scope || '');
    const feeType = String(body.feeType || '');
    const gracePeriod = Number(body.gracePeriod);
    const feeAmount = Number(body.feeAmount);
    const propertyId = body.propertyId ? String(body.propertyId) : null;
    const isActive = body.isActive === undefined ? true : Boolean(body.isActive);

    if (!SCOPES.has(scope)) return res.status(400).json({ error: 'Invalid scope' });
    if (!FEE_TYPES.has(feeType)) return res.status(400).json({ error: 'Invalid feeType' });
    if (!Number.isInteger(gracePeriod) || gracePeriod < 0) return res.status(400).json({ error: 'Invalid gracePeriod' });
    if (!Number.isFinite(feeAmount) || feeAmount < 0) return res.status(400).json({ error: 'Invalid feeAmount' });
    if (scope === 'PROPERTY' && !propertyId) return res.status(400).json({ error: 'propertyId required for PROPERTY scope' });

    const rule = await prisma.lateFeeRule.create({
      data: { scope, propertyId, gracePeriod, feeType, feeAmount, isActive },
    });

    return res.status(200).json(rule);
  } catch (e: any) {
    console.error('admin/latefees/rules error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
