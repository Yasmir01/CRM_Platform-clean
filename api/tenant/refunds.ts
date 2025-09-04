import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { ensurePermission } from '../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = ensurePermission(req, res, 'payments:read');
  if (!user) return;
  const tenantId = String((user as any).sub || (user as any).id);

  try {
    const refunds = await prisma.refund.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(refunds);
  } catch (e: any) {
    console.error('tenant/refunds error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
