import { prisma } from '../_db';
import { ensurePermission } from '../../src/lib/authorize';

export default async function handler(req: any, res: any) {
  const method = req.method || 'GET';

  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (!['ADMIN','SUPER_ADMIN'].includes(role)) return res.status(403).json({ error: 'Forbidden' });

  if (method === 'GET') {
    try {
      const { leaseId } = req.query as { leaseId?: string };
      if (!leaseId) return res.status(400).json({ error: 'Missing leaseId' });
      const lease = await prisma.lease.findUnique({ where: { id: String(leaseId) } });
      if (!lease) return res.status(404).json({ error: 'Not found' });
      const payload = {
        id: lease.id,
        leaseId: lease.id,
        allowPartial: Boolean((lease as any).allowPartial),
        allowSplit: Boolean((lease as any).allowSplit),
        minPartialUsd: typeof (lease as any).minPartialUsd === 'number' ? Number((lease as any).minPartialUsd) : 10,
      };
      return res.status(200).json(payload);
    } catch (e: any) {
      console.error('lease-policies GET error', e?.message || e);
      return res.status(500).json({ error: 'failed' });
    }
  }

  if (method === 'PUT') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { leaseId, allowPartial, allowSplit, minPartialUsd } = body as { leaseId: string; allowPartial?: boolean; allowSplit?: boolean; minPartialUsd?: number };
      if (!leaseId) return res.status(400).json({ error: 'Missing leaseId' });
      const updated = await prisma.lease.update({
        where: { id: String(leaseId) },
        data: {
          allowPartial: typeof allowPartial === 'boolean' ? Boolean(allowPartial) : undefined,
          allowSplit: typeof allowSplit === 'boolean' ? Boolean(allowSplit) : undefined,
          minPartialUsd: typeof minPartialUsd === 'number' ? Number(minPartialUsd) : undefined,
        },
      });
      const payload = {
        id: updated.id,
        leaseId: updated.id,
        allowPartial: Boolean((updated as any).allowPartial),
        allowSplit: Boolean((updated as any).allowSplit),
        minPartialUsd: typeof (updated as any).minPartialUsd === 'number' ? Number((updated as any).minPartialUsd) : 10,
      };
      return res.status(200).json(payload);
    } catch (e: any) {
      console.error('lease-policies PUT error', e?.message || e);
      return res.status(500).json({ error: 'failed' });
    }
  }

  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'Method Not Allowed' });
}
