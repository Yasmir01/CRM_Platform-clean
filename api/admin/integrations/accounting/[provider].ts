import { prisma } from '../../../_db';
import { getUserOr401 } from '../../../../src/utils/authz';

function normProvider(p: string) {
  const v = p.toLowerCase();
  if (v === 'quickbooks' || v === 'qb' || v === 'quickbooksonline') return 'quickbooks';
  if (v === 'xero') return 'xero';
  if (v === 'wave') return 'wave';
  if (v === 'freshbooks' || v === 'freshbook') return 'freshbooks';
  return v;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
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
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    const patch: any = {};
    if (body.enabled !== undefined) patch.enabled = Boolean(body.enabled);
    if (typeof body.apiKey === 'string') {
      patch.accessToken = String(body.apiKey);
      patch.refreshToken = '';
      if (!body.enabled) patch.enabled = true;
      patch.expiresAt = new Date(Date.now() + 365 * 24 * 3600 * 1000);
    }
    if (typeof body.autoSync === 'string') {
      patch.autoSync = String(body.autoSync);
    } else if (typeof body.autoSync === 'boolean') {
      patch.autoSync = body.autoSync ? 'daily' : 'manual';
    }
    if (typeof body.alertOnError === 'boolean') patch.alertOnError = Boolean(body.alertOnError);

    await prisma.accountingConnection.upsert({
      where: { orgId_provider: { orgId: u.orgId, provider } },
      update: patch,
      create: { orgId: u.orgId, provider, enabled: Boolean(body.enabled ?? true), accessToken: String(body.apiKey || ''), refreshToken: '', expiresAt: new Date(Date.now() + 365 * 24 * 3600 * 1000), autoSync: patch.autoSync, alertOnError: patch.alertOnError },
    });

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('admin/integrations/accounting toggle error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
