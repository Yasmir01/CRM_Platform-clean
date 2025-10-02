import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { serialize, parse as parseCookie } from 'cookie';
import { prisma } from '../_db';

const COOKIE_NAME = 'sid';
const JWT_SECRET = process.env.SESSION_JWT_SECRET as string;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const cookieHeader = req.headers['cookie'] as string | undefined;
  const cookies = (req as any).cookies || (cookieHeader ? parseCookie(cookieHeader) : {});
  const raw = cookies[COOKIE_NAME];
  if (!raw) return res.status(400).json({ error: 'Not impersonating' });

  try {
    const payload = jwt.verify(raw, JWT_SECRET) as any;
    if (!payload.impersonating || !payload.originalUserId) {
      return res.status(400).json({ error: 'Not impersonating' });
    }

    await prisma.impersonationLog.updateMany({
      where: { superAdminId: payload.originalUserId, targetUserId: payload.impersonating, endedAt: null },
      data: { endedAt: new Date() },
    });

    // Log history entry for impersonation stop
    try {
      // attempt to resolve subscriber by impersonated user's id
      let subscriberId: string | undefined = undefined;
      try {
        const targetUser = await prisma.user.findUnique({ where: { id: payload.impersonating }, select: { email: true } });
        if (targetUser?.email) {
          const s = await prisma.subscriber.findFirst({ where: { email: targetUser.email }, select: { id: true } });
          if (s) subscriberId = s.id;
        }
      } catch (e) {
        // ignore
      }

      await prisma.history.create({
        data: {
          userId: payload.originalUserId,
          subscriberId: subscriberId || undefined,
          action: 'ImpersonationStopped',
          details: JSON.stringify({ by: payload.originalEmail, targetUserId: payload.impersonating }),
        },
      });
    } catch (e) {
      // ignore history logging errors
    }

    try {
      const { notifyImpersonationEnd } = await import('../../src/lib/impersonationNotify');
      await notifyImpersonationEnd(payload.impersonating, payload.originalEmail);
    } catch {}

    const restored: any = {
      sub: payload.originalUserId,
      email: payload.originalEmail,
      role: 'SUPER_ADMIN',
    };
    const token = jwt.sign(restored, JWT_SECRET, { expiresIn: '7d' });
    const cookie = serialize(COOKIE_NAME, token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    res.setHeader('Set-Cookie', cookie);
    return res.status(200).json({ ok: true, message: 'Impersonation ended' });
  } catch {
    return res.status(400).json({ error: 'Invalid session' });
  }
}
