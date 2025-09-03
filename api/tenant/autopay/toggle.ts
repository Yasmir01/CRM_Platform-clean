import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../../src/utils/authz';
import { prisma } from '../../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const auth = getUserOr401(req, res);
  if (!auth) return;
  const userId = String((auth as any).sub || (auth as any).id);

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const enabled = Boolean(body.enabled);
  const defaultPmId = body.defaultPmId ? String(body.defaultPmId) : null;
  const autopayDayOverride = body.autopayDayOverride !== undefined ? Number(body.autopayDayOverride) : undefined;

  await prisma.tenantPreferences.upsert({
    where: { userId },
    update: { autopayEnabled: enabled, autopayDayOverride },
    create: { userId, autopayEnabled: enabled, autopayDayOverride },
  });

  if (defaultPmId) {
    await prisma.user.update({ where: { id: userId }, data: { defaultPmId } });
  }

  return res.status(200).json({ ok: true });
}
