import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAuthorizedAdmin } from '../_auth';
import { runLateFeeEngine } from '../../src/lib/lateFees';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const isCron = Boolean((req.headers['x-vercel-cron'] as string) || (req.headers['X-Vercel-Cron'] as any));
  if (!isCron && !isAuthorizedAdmin(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const result = await runLateFeeEngine();
    return res.status(200).json({ ok: true, ...result });
  } catch (e: any) {
    console.error('late-fees cron error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
