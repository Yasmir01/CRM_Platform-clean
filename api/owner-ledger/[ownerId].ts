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
  const requesterId = String((user as any).sub || (user as any).id || '');

  const ownerId = String((req.query?.ownerId as string) || '');
  if (!ownerId) return res.status(400).json({ error: 'ownerId required' });

  if (role === 'OWNER' && requesterId !== ownerId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const entries = await prisma.ownerLedger.findMany({
      where: { ownerId },
      include: { property: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(entries);
  } catch (e: any) {
    console.error('owner-ledger error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
