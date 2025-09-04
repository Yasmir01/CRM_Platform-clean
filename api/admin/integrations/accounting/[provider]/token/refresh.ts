import { prisma } from '../../../../../_db';
import { getUserOr401 } from '../../../../../../src/utils/authz';
import { getTokens, saveTokens } from '../../../../../../src/lib/accounting/store';
import { getProvider } from '../../../../../../src/lib/accounting/factory';

function normProvider(p: string) {
  const v = p.toLowerCase();
  if (v === 'quickbooks' || v === 'qb' || v === 'quickbooksonline') return 'quickbooks';
  if (v === 'xero') return 'xero';
  if (v === 'wave') return 'wave';
  if (v === 'freshbooks' || v === 'freshbook') return 'freshbooks';
  return v;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const user = getUserOr401(req, res);
  if (!user) return;
  const u = await prisma.user.findUnique({ where: { id: String((user as any).sub) } });
  if (!u) return res.status(401).json({ error: 'unauthorized' });
  const roles = ((user as any).roles || []).map((r: string) => r.toLowerCase());
  const role = (user as any).role ? String((user as any).role).toLowerCase() : '';
  const isAdmin = roles.includes('admin') || roles.includes('superadmin') || role === 'admin' || role === 'super_admin';
  if (!isAdmin) return res.status(403).json({ error: 'forbidden' });

  try {
    const providerRaw = String((req.query as any).provider || '');
    const provider = normProvider(providerRaw);

    const tokens = await getTokens(u.orgId, provider);
    if (!tokens) return res.status(400).json({ error: 'No tokens' });

    const p = getProvider(provider as any);
    const refreshed = await p.refresh(tokens);
    await saveTokens(u.orgId, provider, refreshed);

    return res.status(200).json({ ok: true, expiresAt: refreshed.expiresAt });
  } catch (e: any) {
    console.error('token refresh error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
