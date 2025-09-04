import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { ensurePermission } from '../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const title = String(body.title || '').trim();
    const message = String(body.message || '').trim();
    if (!title || !message) return res.status(400).json({ error: 'Missing fields' });

    const createdBy = String((user as any).sub || (user as any).id || '');
    await prisma.notification.create({
      data: { title, message, audience: 'ALL', createdBy },
    });

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('superadmin/notify error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
