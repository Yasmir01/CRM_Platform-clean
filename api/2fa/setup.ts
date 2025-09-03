import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../src/utils/authz';
import { prisma } from '../_db';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method Not Allowed' }); }
  const auth = getUserOr401(req, res); if (!auth) return;
  const userId = String((auth as any).sub || (auth as any).id);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ error: 'unauthorized' });

  const appName = process.env.APP_NAME || 'MyCRM';
  const secret = speakeasy.generateSecret({ name: `${appName} (${user.email})`, length: 20 });

  await prisma.user.update({ where: { id: userId }, data: { twoFactorSecret: secret.base32, twoFactorEnabled: false } });

  const otpauth = secret.otpauth_url || '';
  const qr = await QRCode.toDataURL(otpauth);
  return res.status(200).json({ otpauth, qr });
}
