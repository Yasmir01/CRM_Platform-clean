import { prisma } from '../../../../_db';
import { getUserOr401 } from '../../../../../src/utils/authz';

function normProvider(p: string) {
  const v = p.toLowerCase();
  if (v === 'quickbooks' || v === 'qb' || v === 'quickbooksonline') return 'quickbooks';
  if (v === 'xero') return 'xero';
  if (v === 'wave') return 'wave';
  if (v === 'freshbooks' || v === 'freshbook') return 'freshbooks';
  return v;
}

function toLabel(id: string) {
  if (id === 'quickbooks') return 'QuickBooks';
  if (id === 'xero') return 'Xero';
  if (id === 'wave') return 'Wave';
  if (id === 'freshbooks') return 'FreshBooks';
  return id;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
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

    const conn = await prisma.accountingConnection.findUnique({ where: { orgId_provider: { orgId: u.orgId, provider } } });
    const last = await prisma.accountingSyncLog.findFirst({ where: { orgId: u.orgId, provider }, orderBy: { createdAt: 'desc' } });

    const status = last?.status === 'failed' ? 'error' : last?.status === 'pending' ? 'pending' : 'ok';

    return res.status(200).json({
      provider: toLabel(provider),
      enabled: Boolean(conn?.enabled),
      lastSync: last?.createdAt?.toISOString() || null,
      status,
      message: last?.message || null,
    });
  } catch (e: any) {
    console.error('admin/integrations/accounting status error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
