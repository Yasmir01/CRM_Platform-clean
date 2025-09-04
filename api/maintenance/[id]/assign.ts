import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { ensurePermission } from '../../../src/lib/authorize';
import { notify } from '../../../src/lib/notify';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const auth = ensurePermission(req, res, 'maintenance:manage');
  if (!auth) return;

  try {
    const id = String((req.query as any)?.id || '');
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const assigneeId = String(body.assigneeId || '');
    const role = String(body.role || 'staff');
    if (!id || !assigneeId) return res.status(400).json({ error: 'Missing fields' });

    const assignment = await prisma.maintenanceAssignment.create({ data: { requestId: id, assigneeId, role } });
    await prisma.maintenanceRequest.update({ where: { id }, data: { status: 'in_progress' } });

    try {
      const assignee = await prisma.user.findUnique({ where: { id: assigneeId } });
      if (assignee) {
        await notify({ userId: assignee.id, email: assignee.email || undefined, type: 'maintenance_assign', title: 'New Maintenance Assignment', message: `You have been assigned to request ${id}` });
      }
    } catch {}

    return res.status(200).json(assignment);
  } catch (e: any) {
    console.error('maintenance assign error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
