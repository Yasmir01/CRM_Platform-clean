import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { ensurePermission } from '../../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    res.setHeader('Allow', 'PUT,PATCH');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (!['ADMIN','SUPER_ADMIN'].includes(role)) return res.status(403).json({ error: 'Forbidden' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    if (!body.id || body.config == null) return res.status(400).json({ error: 'Invalid request' });

    const gateway = await prisma.paymentGateway.update({
      where: { id: String(body.id) },
      data: { config: body.config },
    });

    return res.status(200).json(gateway);
  } catch (e: any) {
    console.error('gateway config update error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
