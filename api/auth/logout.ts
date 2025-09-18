import type { VercelRequest, VercelResponse } from '@vercel/node';
import { serialize } from 'cookie';

const COOKIE_NAME = 'sid';
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  res.setHeader(
    'Set-Cookie',
    serialize(COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      domain: COOKIE_DOMAIN,
    })
  );

  return res.status(200).json({ ok: true });
}
