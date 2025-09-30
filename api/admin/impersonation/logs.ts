import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { ensurePermission } from '../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = ensurePermission(req as any, res as any, '*');
  if (!user) return;

  const role = String((user as any).role || '').toUpperCase();
  if (role !== 'SUPER_ADMIN' && role !== 'SUPERADMIN') return res.status(403).json({ error: 'Forbidden' });

  try {
    if (req.method === 'GET') {
      const logs = await prisma.impersonationLog.findMany({
        include: {
          superAdmin: { select: { id: true, email: true } },
          subscriber: { select: { id: true, name: true, companyName: true } },
        },
        orderBy: { startedAt: 'desc' },
        take: 1000,
      });
      return res.status(200).json(logs);
    }

    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  } catch (err: any) {
    console.error('impersonation logs error', err);
    return res.status(500).json({ error: 'failed' });
  }
}
