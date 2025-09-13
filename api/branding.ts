import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_db';
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'sid';
const JWT_SECRET = process.env.SESSION_JWT_SECRET as string;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const url = req.url || '';
    // parse propertyId from query if provided
    const propertyId = (req.query && (req.query as any).propertyId) ? String((req.query as any).propertyId) : undefined;

    // Try to read session cookie without forcing 401
    const cookieHeader = req.headers?.cookie as string | undefined;
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const raw = cookies[COOKIE_NAME];

    let account: any = null;

    if (raw && JWT_SECRET) {
      try {
        const payload = jwt.verify(raw, JWT_SECRET) as any;
        const userId = payload.sub || payload.id || payload.sub;
        if (userId) {
          const dbUser = await prisma.user.findUnique({ where: { id: String(userId) }, include: { account: true } });
          if (dbUser && dbUser.account) account = dbUser.account;
        }
      } catch (e) {
        // ignore invalid token
      }
    }

    if (!account && propertyId) {
      const property = await prisma.property.findUnique({ where: { id: propertyId }, include: { account: true } });
      if (property && property.account) account = property.account;
    }

    return res.status(200).json({
      name: account?.name ?? 'Company',
      logoUrl: account?.logoUrl ?? null,
      address: account?.address ?? null,
      phone: account?.phone ?? null,
      email: account?.email ?? null,
    });
  } catch (err: any) {
    console.error('branding error', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
