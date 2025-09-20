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

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const email = String((body.email || '').trim()).toLowerCase();
  const password = String(body.password || '');

  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password || '');
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const payload: any = { sub: user.id, email: user.email, role: user.role, plan: (user as any).subscriptionPlan };
    const token = jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256', expiresIn: '7d' });

    res.setHeader(
      'Set-Cookie',
      serialize(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        domain: COOKIE_DOMAIN,
      })
    );

    const safeUser = { id: user.id, email: user.email, name: user.name, role: user.role, subscriptionPlan: (user as any).subscriptionPlan };
    return res.status(200).json({ ok: true, user: safeUser, token });
  } catch (err: any) {
    console.error('login error', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
