import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { getUserOr401 } from '../../../src/utils/authz';
import { notify } from '../../../src/lib/notify';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const role = String((user as any).role || '').toUpperCase();
    if (!['MANAGER','ADMIN','SUPER_ADMIN'].includes(role)) return res.status(401).json({ error: 'Unauthorized' });

    const id = String((req.query as any)?.id || '');
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const status = String(body.status || '').trim();
    if (!id || !status) return res.status(400).json({ error: 'Missing fields' });

    const updated = await prisma.maintenanceRequest.update({ where: { id }, data: { status } });

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
    console.error('maintenance status error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
