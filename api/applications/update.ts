import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';
import { notify } from '../../src/lib/notify';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'PATCH') { res.setHeader('Allow', 'POST, PUT, PATCH'); return res.status(405).json({ error: 'Method Not Allowed' }); }
  const auth = getUserOr401(req, res); if (!auth) return;
  const userId = String((auth as any).sub || (auth as any).id);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  if (!['ADMIN','MANAGER','SUPER_ADMIN'].includes(user.role as any)) return res.status(403).json({ error: 'forbidden' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const id = String(body.id || '');
  const status = String(body.status || '');
  if (!id || !status) return res.status(400).json({ error: 'missing' });

  const updated = await prisma.tenantApplication.update({ where: { id }, data: { status } });

  await notify({ email: updated.email, type: 'application_update', title: 'Application Status Update', message: `Your application status is now: ${status}` });
  return res.status(200).json(updated);
}
