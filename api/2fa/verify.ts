import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../src/utils/authz';
import { prisma } from '../_db';
import speakeasy from 'speakeasy';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method Not Allowed' }); }
  const auth = getUserOr401(req, res); if (!auth) return;
  const userId = String((auth as any).sub || (auth as any).id);

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const token = String(body.token || '');
  if (!token) return res.status(400).json({ error: 'token required' });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.twoFactorSecret) return res.status(400).json({ error: 'no secret' });

  const ok = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token, window: 1 });
  if (!ok) return res.status(400).json({ error: 'invalid code' });

  await prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: true } });
  return res.status(200).json({ ok: true });
}
