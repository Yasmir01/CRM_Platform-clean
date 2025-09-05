import { prisma } from '../../_db';
import { getUserOr401 } from '../../../src/utils/authz';

function toProviderId(p?: string) {
  const v = String(p || '').toLowerCase();
  if (['quickbooks','qb','quickbooksonline'].includes(v)) return 'quickbooks';
  if (['xero'].includes(v)) return 'xero';
  if (['wave'].includes(v)) return 'wave';
  return '';
}

function toProviderLabel(id: string) {
  if (id === 'quickbooks') return 'QuickBooks';
  if (id === 'xero') return 'Xero';
  if (id === 'wave') return 'Wave';
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
    const providerQ = (req.query as any).provider as string | undefined;
    const pid = providerQ && providerQ !== 'all' ? toProviderId(providerQ) : '';

    const where: any = { orgId: u.orgId };
    if (pid) where.provider = pid;

    const logs = await prisma.accountingSyncLog.findMany({ where, orderBy: { createdAt: 'desc' }, take: 500 });

    const data = logs.map((l) => ({
      id: l.id,
      provider: toProviderLabel(l.provider),
      status: (l.status === 'success' ? 'ok' : l.status === 'failed' ? 'error' : 'ok') as 'ok' | 'error',
      startedAt: l.createdAt.toISOString(),
      finishedAt: l.createdAt.toISOString(),
      details: l.message || undefined,
    }));

    return res.status(200).json(data);
  } catch (e: any) {
    console.error('admin/integrations/logs error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
