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
  if (role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });

  try {
    const subs = await prisma.subscriber.findMany({
      include: {
        subscriptions: {
          include: { plan: true, payments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json(subs);
  } catch (e: any) {
    console.error('superadmin/subscribers error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
