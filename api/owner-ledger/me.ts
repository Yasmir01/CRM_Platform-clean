import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { ensurePermission } from '../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (role !== 'OWNER' && role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const ownerId = String((user as any).sub || (user as any).id || '');
  try {
    const entries = await prisma.ownerLedger.findMany({
      where: { ownerId },
      include: { property: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(entries);
  } catch (e: any) {
    console.error('owner-ledger/me error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
