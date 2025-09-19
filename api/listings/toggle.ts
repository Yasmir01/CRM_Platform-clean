import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setPublished } from './_store';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');
  const { safeParse } = await import('../src/utils/safeJson');
  const body = typeof req.body === 'string' ? safeParse(req.body, {}) : (req.body || {});
  const { unitId, isActive } = body as { unitId?: string; isActive?: boolean };
  if (!unitId || typeof isActive !== 'boolean') return res.status(400).json({ error: 'invalid' });
  setPublished(unitId, isActive);
  return res.status(200).json({ ok: true });
}
