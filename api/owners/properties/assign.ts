import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../../../src/utils/authz';
import { prisma } from '../../../_db';
import { safeParse } from '../../../../src/utils/safeJson';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = getUserOr401(req, res);
  if (!admin) return;
  if (!String((admin as any).role || '').toLowerCase().includes('super') && !String((admin as any).role || '').toLowerCase().includes('admin')) return res.status(403).json({ error: 'forbidden' });

  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const body = typeof req.body === 'string' ? safeParse(req.body, {}) : (req.body || {});
    const ownerId = String(body.ownerId || '').trim();
    const propertyId = String(body.propertyId || '').trim();
    const pct = Number.isFinite(body.ownershipPercentage) ? Number(body.ownershipPercentage) : 100;
    if (!ownerId || !propertyId) return res.status(400).json({ error: 'Missing fields' });

    const op = await prisma.ownerProperty.create({ data: { ownerId, propertyId, ownershipPercentage: pct as any } });
    return res.status(200).json(op);
  } catch (e: any) {
    console.error('owners/properties/assign error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
