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

    await prisma.syncQueue.create({
      data: {
        orgId: u.orgId,
        provider,
        task: 'pull_accounts',
        payload: {},
      },
    });

    await prisma.accountingSyncLog.create({
      data: { orgId: u.orgId, provider, direction: 'push', entity: 'manual_sync', payload: {}, status: 'pending', message: 'manual trigger' },
    });

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('admin/integrations/accounting sync error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
