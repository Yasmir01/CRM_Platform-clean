import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../../_db';
import { ensurePermission } from '../../../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const auth = ensurePermission(req, res, 'maintenance:manage');
  if (!auth) return;

  try {
    const id = String((req.query as any)?.id || '');
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const status = String(body.status || '').toLowerCase();
    if (!id || !['approved','rejected'].includes(status)) return res.status(400).json({ error: 'Invalid request' });

    const updated = await prisma.maintenanceInvoice.update({ where: { id }, data: { status } });
    return res.status(200).json(updated);
  } catch (e: any) {
    console.error('invoice review error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
