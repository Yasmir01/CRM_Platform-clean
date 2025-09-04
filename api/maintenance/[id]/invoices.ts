import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { getUserOr401 } from '../../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    const userId = String((user as any).sub || (user as any).id);
    const role = String((user as any).role || (Array.isArray((user as any).roles) ? (user as any).roles[0] : '')).toUpperCase();
    const id = String((req.query as any)?.id || '');
    if (!id) return res.status(400).json({ error: 'Missing id' });

    const reqRec = await prisma.maintenanceRequest.findUnique({ where: { id } });
    if (!reqRec) return res.status(404).json({ error: 'Request not found' });

    let allowed = false;
    if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'MANAGER' || role === 'OWNER') {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      allowed = !!(dbUser && reqRec.orgId && dbUser.orgId === reqRec.orgId);
    } else if (role === 'VENDOR') {
      const assignment = await prisma.maintenanceAssignment.findFirst({ where: { requestId: id, assigneeId: userId } });
      allowed = Boolean(assignment);
    } else if (role === 'TENANT') {
      allowed = reqRec.tenantId === userId;
    }

    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const invoices = await prisma.maintenanceInvoice.findMany({ where: { requestId: id }, orderBy: { uploadedAt: 'desc' }, include: { files: true } });
    return res.status(200).json(invoices);
  } catch (e: any) {
    console.error('request invoices error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
