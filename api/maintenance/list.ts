import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../src/utils/authz';
import { prisma } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');

  const auth = getUserOr401(req, res);
  if (!auth) return;
  const userId = String((auth as any).sub || (auth as any).id);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ error: 'unauthorized' });

  const isSuper = user.role === 'SUPER_ADMIN';
  const isOrgAdmin = ['ADMIN','MANAGER','OWNER'].includes(user.role as any);

  let where: any = {};
  if (isSuper) {
    // no org restriction
  } else if (isOrgAdmin) {
    where.orgId = user.orgId;
  } else {
    where.tenantId = user.id;
  }

  // Filters
  const status = String((req.query as any)?.status || '').trim();
  const propertyId = String((req.query as any)?.propertyId || '').trim();
  const vendorId = String((req.query as any)?.vendorId || '').trim();
  if (status) where.status = status;
  if (propertyId) where.propertyId = propertyId;
  if (vendorId) where.vendorId = vendorId;

  const items = await prisma.maintenanceRequest.findMany({
    where,
    include: {
      // tenant limited info
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // @ts-ignore
      tenant: { select: { name: true, email: true } as any },
      // property address (schema has address field)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // @ts-ignore
      property: { select: { address: true } as any },
      attachments: true,
      assignments: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  // Enrich with vendor user info when available
  const vIds = Array.from(new Set(items.map((i) => i.vendorId).filter(Boolean))) as string[];
  let vendorMap: Record<string, { id: string; name: string | null; email: string | null }> = {};
  if (vIds.length) {
    const vendors = await prisma.user.findMany({ where: { id: { in: vIds } }, select: { id: true, name: true, email: true } });
    vendorMap = Object.fromEntries(vendors.map((v) => [v.id, v]));
  }
  const enriched = items.map((i) => ({
    ...i,
    vendor: i.vendorId ? vendorMap[i.vendorId] || null : null,
  }));

  return res.status(200).json(enriched);
}
