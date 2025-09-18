import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const COOKIE_NAME = 'sid';
const JWT_SECRET = process.env.SESSION_JWT_SECRET as string;
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');
  if (!JWT_SECRET) return res.status(500).json({ error: 'SESSION_JWT_SECRET not set' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const token = String(body.token || '');
    const password = String(body.password || '');
    const name = body.name ? String(body.name) : undefined;

    if (!token || !password) return res.status(400).json({ error: 'Missing token or password' });

    const invite = await prisma.vendorInvite.findUnique({ where: { token } }).catch(() => null);
    if (!invite) return res.status(400).json({ error: 'Invalid invite token' });
    if (invite.used) return res.status(400).json({ error: 'Invite already used' });
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) return res.status(400).json({ error: 'Invite expired' });

    // Create or find user
    let user = await prisma.user.findUnique({ where: { email: invite.email } }).catch(() => null);
    if (!user) {
      const hash = await bcrypt.hash(password, 10);
      user = await prisma.user.create({ data: { email: invite.email, password: hash, name: name || invite.name || undefined, role: 'Service Provider' } });
    } else {
      const hash = await bcrypt.hash(password, 10);
      try { await prisma.user.update({ where: { id: user.id }, data: { password: hash, name: name || invite.name || undefined, role: 'Service Provider' } }); } catch (e) {}
    }

    // Link service provider record if available
    try {
      if (invite.vendorId) {
        await prisma.serviceProvider.update({ where: { id: invite.vendorId }, data: { email: invite.email, name: name || invite.name || undefined } });
      } else {
        // create a service provider entry if not present
        await prisma.serviceProvider.upsert({ where: { email: invite.email }, update: { name: name || invite.name || undefined }, create: { email: invite.email, name: name || invite.name || undefined } });
      }
    } catch (e) {
      console.warn('Failed to link service provider record', e);
    }

    // Mark invite used
    try { await prisma.vendorInvite.update({ where: { token }, data: { used: true } }); } catch (e) {}

    // Issue cookie
    const payload: any = { sub: user.id, email: user.email, role: user.role, plan: (user as any).subscriptionPlan };
    const jwtToken = jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256', expiresIn: '7d' });
    res.setHeader('Set-Cookie', serialize(COOKIE_NAME, jwtToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7, domain: COOKIE_DOMAIN }));

    return res.status(200).json({ ok: true, user: { id: user.id, email: user.email } });
  } catch (err: any) {
    console.error('accept vendor invite error', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
