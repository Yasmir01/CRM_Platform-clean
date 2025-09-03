import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';
import { startTransUnionScreening } from '../../src/lib/screening/transunion';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method Not Allowed' }); }
  const auth = getUserOr401(req, res); if (!auth) return;
  const userId = String((auth as any).sub || (auth as any).id);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  if (!['ADMIN','MANAGER','SUPER_ADMIN'].includes(user.role as any)) return res.status(403).json({ error: 'forbidden' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const appId = String(body.appId || '');
  const provider = String(body.provider || 'transunion');
  if (!appId) return res.status(400).json({ error: 'appId required' });

  const screening = await prisma.tenantScreening.create({ data: { appId, provider, status: 'pending' } });
  if (provider === 'transunion') await startTransUnionScreening(screening.id, appId);

  return res.status(200).json({ ok: true, screening });
}
