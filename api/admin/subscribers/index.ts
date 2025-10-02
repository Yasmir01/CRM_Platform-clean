import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { ensurePermission } from '../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = ensurePermission(req as any, res as any, '*');
  if (!user) return;

  // restrict to super admin role explicitly
  const role = String((user as any).role || '').toUpperCase();
  if (role !== 'SUPER_ADMIN' && role !== 'SUPERADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    if (req.method === 'GET') {
      const subscribers = await prisma.subscriber.findMany({
        include: { plan: true, users: { select: { email: true, role: true } } },
      });
      return res.status(200).json(subscribers);
    }

    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  } catch (err: any) {
    console.error('admin subscribers index error', err);
    return res.status(500).json({ error: 'failed' });
  }
}
