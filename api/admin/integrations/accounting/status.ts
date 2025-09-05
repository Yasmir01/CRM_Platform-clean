import { getUserOr401 } from '../../../../src/utils/authz';

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
    const providers = ['quickbooks', 'xero', 'wave'];
    const conns = await prisma.accountingConnection.findMany({ where: { orgId: u.orgId } });
    const lastLogs = await prisma.accountingSyncLog.findMany({ where: { orgId: u.orgId }, orderBy: { createdAt: 'desc' }, take: 100 });

    const items = providers.map((p) => {
      const conn = conns.find((c) => normProvider(c.provider) === p);
      const connected = Boolean(conn?.enabled);
      const last = lastLogs.find((l) => normProvider(l.provider) === p);
      const lastSynced = last?.createdAt?.toISOString() || null;
      const autoSync = !!(conn?.autoSync && conn.autoSync !== 'manual');
      const alertOnError = Boolean(conn?.alertOnError);
      return { provider: toLabel(p), connected, lastSynced, autoSync, alertOnError };
    });

    return res.status(200).json(items);
  } catch (e: any) {
    console.error('admin/integrations/accounting status list error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
