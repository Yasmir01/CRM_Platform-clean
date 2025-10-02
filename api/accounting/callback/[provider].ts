import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getProvider } from '../../../src/lib/accounting/factory';
import { saveTokens } from '../../../src/lib/accounting/store';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  const query = req.query as any;
  const code = String(query.code || '');
  const state = String(query.state || '');
  const providerName = String(query.provider || '');
  if (!code) return res.status(400).json({ error: 'Missing code' });

  try {
    const provider = getProvider(providerName as any);
    const tokens = await provider.exchangeCode(code, state);
    const m = /org:([^&]+)/.exec(state);
    const orgId = (m && m[1]) || 'unknown';
    await saveTokens(orgId, provider.name, tokens);
    res.statusCode = 302;
    res.setHeader('Location', '/crm/admin/accounting');
    return res.end();
  } catch (e: any) {
    return res.status(400).json({ error: e?.message || 'OAuth error' });
  }
}
