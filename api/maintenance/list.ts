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
    // no filter
  } else if (isOrgAdmin) {
    where.orgId = user.orgId;
  } else {
    where.tenantId = user.id;
  }

  const items = await prisma.maintenanceRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return res.status(200).json(items);
}
