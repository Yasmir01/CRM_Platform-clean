import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';
import { prisma } from '../_db';

const COOKIE_NAME = 'impersonationToken';
const SECRET = process.env.SESSION_JWT_SECRET as string;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const cookieHeader = req.headers['cookie'] as string | undefined;
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const raw = cookies[COOKIE_NAME];
  if (!raw) {
    return res.status(400).json({ error: 'Not impersonating' });
  }

  try {
    const payload = jwt.verify(raw, SECRET) as any;
    const superAdminId = payload.impersonatedBy || payload.impersonatedBy || null;
    const targetUserId = payload.sub || null;

    if (superAdminId && targetUserId) {
      await prisma.impersonationLog.updateMany({ where: { superAdminId, targetUserId, endedAt: null }, data: { endedAt: new Date() } });
    }
  } catch (e) {
    // ignore verification errors
  }

  // Clear cookie
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly=false; SameSite=Lax`);
  return res.status(200).json({ ok: true });
}
