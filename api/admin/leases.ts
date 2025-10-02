import { prisma } from '../_db';
import { ensurePermission } from '../../src/lib/authorize';
import { prisma } from '../_db';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (!['ADMIN','SUPER_ADMIN'].includes(role)) return res.status(403).json({ error: 'Forbidden' });

  try {
    const leases = await prisma.lease.findMany({
      include: {
        unit: true,
        tenant: true,
        participants: true,
      },
      orderBy: { createdAt: 'desc' },
    } as any);

    const tenantIds = Array.from(new Set(leases.flatMap(l => l.participants.map(p => p.tenantId))));
    const participantTenants = tenantIds.length ? await prisma.tenant.findMany({ where: { id: { in: tenantIds } } }) : [];
    const ptMap = new Map(participantTenants.map(t => [t.id, t.name] as const));

    const data = leases.map((l: any) => {
      const primaryName = l.tenant?.name || 'Primary Tenant';
      const roommates = (l.participants || []).map((p: any) => ptMap.get(p.tenantId) || p.tenantId);
      return {
        id: l.id,
        name: `${l.unit?.number || 'Unit'} — ${primaryName}`,
        propertyId: l.unit?.propertyId || '',
        tenantNames: [primaryName, ...roommates.filter(Boolean)],
      };
    });

    return res.status(200).json(data);
  } catch (e: any) {
    console.error('admin/leases GET error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
