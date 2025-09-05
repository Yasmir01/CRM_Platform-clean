import { prisma } from './_db';
import { getUserOr401 } from '../src/utils/authz';

function toProviderId(p?: string) {
  const v = String(p || '').toLowerCase();
  if (['quickbooks','qb','quickbooksonline'].includes(v)) return 'quickbooks';
  if (['xero'].includes(v)) return 'xero';
  if (['wave'].includes(v)) return 'wave';
  return '';
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

  try {
    const providerQ = (req.query as any).provider as string | undefined;
    const pid = providerQ && providerQ !== 'all' ? toProviderId(providerQ) : '';

    const where: any = { orgId: u.orgId };
    if (pid) where.provider = pid;

    const logs = await prisma.accountingSyncLog.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 });

    const formatted = logs.map((log) => {
      const payload: any = log.payload as any;
      const entity = (() => {
        try {
          const p = payload || {};
          const type = p.entityType || p.resourceType || log.entity || undefined;
          const id = p.Id || p.InvoiceID || p.PaymentID || p.ContactID || p.resourceId || undefined;
          const name = p.DisplayName || p.Name || p.Contact?.Name || undefined;
          const amount = p.TotalAmt || p.Total || p.Amount || undefined;
          const status = p.Status || undefined;
          return { type, id, name, amount, status };
        } catch {
          return null;
        }
      })();
      const source = log.direction === 'pull' ? 'webhook' : (log.entity === 'manual_sync' ? 'manual' : 'push');
      return {
        id: log.id,
        createdAt: log.createdAt,
        provider: log.provider,
        entity,
        source,
        status: log.status,
      };
    });

    return res.status(200).json(formatted);
  } catch (e: any) {
    console.error('sync-logs error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
