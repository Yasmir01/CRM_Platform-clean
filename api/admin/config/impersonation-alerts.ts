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
      const config = await prisma.systemConfig.findFirst();
      return res.status(200).json({ impersonationAlerts: config?.impersonationAlerts ?? true });
    }

    if (req.method === 'PATCH') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const enabled = Boolean(body.enabled);
      const config = await prisma.systemConfig.upsert({ where: { id: 'singleton' }, update: { impersonationAlerts: enabled }, create: { id: 'singleton', impersonationAlerts: enabled } });
      return res.status(200).json(config);
    }

    res.setHeader('Allow', 'GET,PATCH');
    return res.status(405).end('Method Not Allowed');
  } catch (err: any) {
    console.error('impersonation alerts config error', err);
    return res.status(500).json({ error: 'failed' });
  }
}
