import { prisma } from '../../../_db';
import { ensurePermission } from '../../../../src/lib/authorize';

export default async function handler(req: any, res: any) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'PUT');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) return res.status(403).json({ error: 'Forbidden' });

  try {
    const { leaseId } = req.query as { leaseId: string };
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const participants: Array<{ tenantId: string; shareType: string; shareValue?: number }>= Array.isArray(body.participants) ? body.participants : [];

    // Basic validation for percentages
    const pctTotal = participants.filter((p) => p.shareType === 'PERCENTAGE').reduce((s, p) => s + Number(p.shareValue || 0), 0);
    if (pctTotal && Math.abs(pctTotal - 100) > 0.001) {
      return res.status(400).json({ error: 'Percentage shares must sum to 100' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.leaseParticipant.deleteMany({ where: { leaseId } });
      for (const p of participants) {
        await tx.leaseParticipant.create({
          data: {
            leaseId,
            tenantId: String(p.tenantId),
            shareType: String(p.shareType),
            shareValue: p.shareType === 'EQUAL' ? null : Number(p.shareValue ?? 0),
          },
        });
      }

      if (typeof body.allowSplit === 'boolean' || typeof body.allowPartial === 'boolean') {
        await tx.lease.update({
          where: { id: leaseId },
          data: {
            allowSplit: typeof body.allowSplit === 'boolean' ? Boolean(body.allowSplit) : undefined,
            allowPartial: typeof body.allowPartial === 'boolean' ? Boolean(body.allowPartial) : undefined,
          },
        });
      }
    });

    return res.status(204).end();
  } catch (e: any) {
    console.error('leases/[leaseId]/splits PUT error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
