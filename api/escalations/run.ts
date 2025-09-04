import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runEscalations } from '../_lib/escalationRunner';
import { isAuthorizedAdmin } from '../_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow Vercel Cron trigger or manual admin token
  const isCron = Boolean((req.headers['x-vercel-cron'] as string) || (req.headers['X-Vercel-Cron'] as any));
  if (!isCron && !isAuthorizedAdmin(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const result = await runEscalations();
    return res.status(200).json({ ok: true, ...result });
  } catch (e: any) {
    console.error('escalations run error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
