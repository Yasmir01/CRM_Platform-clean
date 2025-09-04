import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensurePermission } from '../../src/lib/authorize';
import { prisma } from '../_db';
import { notify } from '../../src/lib/notify';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'PATCH') {
    res.setHeader('Allow', 'POST, PUT, PATCH');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const auth = ensurePermission(req, res, 'maintenance:manage');
  if (!auth) return;

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const id = String(body.id || '');
  if (!id) return res.status(400).json({ error: 'id required' });

  const data: any = {};
  if (body.status) data.status = String(body.status);
  if (body.assignedTo) data.assignedTo = String(body.assignedTo);

  try {
    const updated = await prisma.maintenanceRequest.update({ where: { id }, data });

    // Notify tenant of status changes
    try {
      if (updated.tenantId) {
        const tenant = await prisma.user.findUnique({ where: { id: updated.tenantId } });
        await notify({
          userId: tenant?.id,
          email: tenant?.email || undefined,
          type: 'maintenance_update',
          title: 'Maintenance Update',
          message: `Your request "${updated.title}" status is now: ${updated.status}`,
          meta: { requestId: updated.id, link: `/tenant/maintenance?id=${updated.id}` },
        });
      }
    } catch {}

    return res.status(200).json(updated);
  } catch (e: any) {
    console.error('maintenance update error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
