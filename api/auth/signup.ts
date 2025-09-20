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
  const name = body.name ? String(body.name) : undefined;
  const role = body.role ? String(body.role) : 'Tenant';

  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        name: name || undefined,
        role,
        // subscription defaults handled by Prisma schema
      },
      select: { id: true, email: true, name: true, role: true, subscriptionPlan: true, subscriptionStatus: true }
    });

    const payload: any = { sub: user.id, email: user.email, role: user.role, plan: user.subscriptionPlan };
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

    return res.status(201).json({ ok: true, user, token });
  } catch (err: any) {
    console.error('signup error', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
