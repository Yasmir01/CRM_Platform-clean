import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../pages/api/_db';
import { ensurePermission } from '../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = ensurePermission(req as any, res as any, '*');
  if (!user) return;

  try {
    if (req.method === 'GET') {
      const items = await prisma.scheduledExport.findMany({ where: { suId: String((user as any).sub || (user as any).id) } });
      return res.status(200).json(items);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { type, frequency, email } = body;
      if (!type || !frequency || !email) return res.status(400).json({ error: 'Missing fields' });

      const isSU = String((user as any).role || '').toUpperCase() === 'SUPER_ADMIN' || String((user as any).role || '').toUpperCase() === 'SUPERADMIN';

      // Attempt to resolve subscriberId from user payload (some users have subscriberId/orgId/accountId)
      const subscriberId = (user as any).subscriberId || (user as any).orgId || (user as any).accountId || null;

      // Check plan restrictions for non-SU users
      if (!isSU) {
        if (!subscriberId) return res.status(403).json({ error: 'Forbidden' });
        const subscriber = await prisma.subscriber.findUnique({ where: { id: subscriberId }, include: { plan: true } });
        const planAllows = Boolean(subscriber?.plan?.allowExports) || Boolean(subscriber?.forceAllowExports);
        if (!planAllows) return res.status(403).json({ error: 'Your plan does not allow scheduled exports' });
      }

      const created = await prisma.scheduledExport.create({ data: { type, frequency, email, suId: String((user as any).sub || (user as any).id) } });
      return res.status(201).json(created);
    }

    res.setHeader('Allow', 'GET,POST');
    return res.status(405).end('Method Not Allowed');
  } catch (err: any) {
    console.error('scheduled-exports index error', err);
    return res.status(500).json({ error: 'failed' });
  }
}
