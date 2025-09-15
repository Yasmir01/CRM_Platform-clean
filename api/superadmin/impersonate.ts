import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { ensurePermission } from '../../src/lib/authorize';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const COOKIE_NAME = 'sid';
const JWT_SECRET = process.env.SESSION_JWT_SECRET as string;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const su = ensurePermission(req, res, '*');
  if (!su) return;
  const role = String((su as any).role || '').toUpperCase();
  const superAdminId = String((su as any).sub || (su as any).id || '');
  const superAdminEmail = String((su as any).email || '');
  if (role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const targetUserId = String(body.targetUserId || '');
  if (!targetUserId) return res.status(400).json({ error: 'targetUserId required' });

  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) return res.status(404).json({ error: 'User not found' });

  await prisma.impersonationLog.create({
    data: { superAdminId, targetUserId },
  });

  // Log history entry for impersonation start (attempt to resolve subscriber by target email)
  try {
    const targetSubscriber = await prisma.subscriber.findFirst({ where: { email: target.email }, select: { id: true } });
    await prisma.history.create({
      data: {
        userId: superAdminId,
        subscriberId: targetSubscriber ? targetSubscriber.id : undefined,
        action: 'ImpersonationStarted',
        details: JSON.stringify({ by: superAdminEmail, targetUserId }),
      },
    });
  } catch (e) {
    // ignore history logging errors
  }

  // Notify target user
  try {
    const { notifyImpersonation } = await import('../../src/lib/impersonationNotify');
    await notifyImpersonation(target.id, superAdminEmail);
  } catch {}

  const payload: any = {
    sub: target.id,
    email: target.email,
    role: target.role,
    orgId: target.orgId,
    impersonating: target.id,
    originalUserId: superAdminId,
    originalEmail: superAdminEmail,
    originalRole: 'SUPER_ADMIN',
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  const cookie = serialize(COOKIE_NAME, token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  res.setHeader('Set-Cookie', cookie);
  return res.status(200).json({ ok: true, impersonating: target.email });
}
