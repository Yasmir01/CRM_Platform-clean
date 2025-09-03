import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../../_db';
import { getUserOr401 } from '../../../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Method Not Allowed' }); }
  const auth = getUserOr401(req, res); if (!auth) return;
  const userId = String((auth as any).sub || (auth as any).id);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  if (!['ADMIN','SUPER_ADMIN','MANAGER'].includes(user.role as any)) return res.status(403).json({ error: 'forbidden' });

  const status = (req.query?.status as string) || undefined;
  const tenantId = (req.query?.tenantId as string) || undefined;

  const payments = await prisma.rentPayment.findMany({
    where: { status: status || undefined, tenantId: tenantId || undefined },
    orderBy: { createdAt: 'desc' },
    include: { lease: { select: { title: true, tenantId: true } } },
  });

  return res.status(200).json(payments);
}
