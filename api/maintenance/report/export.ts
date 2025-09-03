import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { getUserOr401 } from '../../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  const auth = getUserOr401(req, res);
  if (!auth) return;
  const userId = String((auth as any).sub || (auth as any).id);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ error: 'unauthorized' });

  const isSuper = user.role === 'SUPER_ADMIN';
  const isOrgAdmin = ['ADMIN','MANAGER','OWNER'].includes(user.role as any);
  if (!isSuper && !isOrgAdmin) {
    return res.status(403).json({ error: 'forbidden' });
  }

  const where: any = {};
  if (!isSuper) where.orgId = user.orgId;

  const requests = await prisma.maintenanceRequest.findMany({ where, orderBy: { createdAt: 'desc' } });

  const header = 'ID,Title,Priority,Status,Created,Updated\n';
  const esc = (s: string) => '"' + s.replace(/"/g, '""') + '"';
  const rows = requests
    .map((r) => [r.id, esc(r.title), r.priority, r.status, new Date(r.createdAt).toISOString(), new Date(r.updatedAt).toISOString()].join(','))
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=maintenance_report.csv');
  return res.status(200).send(header + rows);
}
