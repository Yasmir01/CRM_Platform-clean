import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../../_db';
import { ensurePermission } from '../../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = ensurePermission(req as any, res as any, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (role !== 'SUPER_ADMIN' && role !== 'SUPERADMIN') return res.status(403).json({ error: 'Forbidden' });

  try {
    const id = String(req.query?.id || '');
    if (!id) return res.status(400).json({ error: 'Missing id' });

    if (req.method === 'PATCH') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { enabled } = body;
      // enabled can be true/false/null; client will send true/false
      const data: any = { impersonationAlerts: typeof enabled === 'boolean' ? enabled : null };
      const updated = await prisma.subscriber.update({ where: { id }, data });
      return res.status(200).json(updated);
    }

    res.setHeader('Allow', 'PATCH');
    return res.status(405).end('Method Not Allowed');
  } catch (err: any) {
    console.error('subscriber alerts error', err);
    return res.status(500).json({ error: 'failed' });
  }
}
