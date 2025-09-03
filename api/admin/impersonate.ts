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

  const admin = ensurePermission(req, res, 'users:manage');
  if (!admin) return;
  const role = String((admin as any).role || '').toUpperCase();
  if (role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const targetUserId = String(body.targetUserId || '');
  if (!targetUserId) return res.status(400).json({ error: 'targetUserId required' });

  const orgId = String((admin as any).orgId || '');
  if (!orgId) return res.status(400).json({ error: 'Missing orgId' });

  const settings = await prisma.orgSettings.findUnique({ where: { orgId } });
  if (!settings?.allowImpersonation) {
    return res.status(403).json({ error: 'Impersonation disabled for this org' });
  }

  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) return res.status(404).json({ error: 'User not found' });
  if (target.orgId !== orgId) return res.status(403).json({ error: 'Cross-org impersonation not allowed' });
  const targetRole = String(target.role || '').toUpperCase();
  if (targetRole === 'ADMIN' || targetRole === 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Cannot impersonate this role' });
  }

  await prisma.impersonationLog.create({ data: { adminId: String((admin as any).sub || (admin as any).id), targetUserId } });

  // Notify target user by email and in-app
  try {
    const { notifyImpersonation } = await import('../../src/lib/impersonationNotify');
    await notifyImpersonation(target.id, String((admin as any).email || ''));
  } catch {}

  const payload: any = {
    sub: target.id,
    email: target.email,
    role: target.role,
    orgId: target.orgId,
    impersonating: target.id,
    originalUserId: String((admin as any).sub || (admin as any).id),
    originalEmail: String((admin as any).email || ''),
    originalRole: 'ADMIN',
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
