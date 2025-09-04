import { saveTokens } from '../../../src/lib/accounting/store';
import { getProvider } from '../../../src/lib/accounting/factory';

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
    res.setHeader('Location', '/crm/super-admin/accounting-integrations');
    return res.end();
  } catch (e: any) {
    return res.status(400).json({ error: e?.message || 'exchange_failed' });
  }
}
