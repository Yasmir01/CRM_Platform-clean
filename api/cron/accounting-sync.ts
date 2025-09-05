import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAuthorizedAdmin } from '../_auth';
import { runAccountingQueue } from '../../src/lib/accounting/runAccountingQueue';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  if (!isAuthorizedAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
  await runAccountingQueue();
  return res.status(200).json({ ok: true });
}
