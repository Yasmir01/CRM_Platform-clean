import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { rateLimit } from '../../src/utils/rateLimit';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method Not Allowed' }); }
  const ip = ((req.headers['x-forwarded-for'] as string) || '').split(',')[0]?.trim() || (req.socket as any).remoteAddress || 'unknown';
  const { allowed } = rateLimit(ip, req.url || 'app-attach', 60, 60_000);
  if (!allowed) return res.status(429).json({ error: 'Too many requests' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const appId = String(body.appId || '');
  const type = String(body.type || '');
  const key = String(body.key || '');
  if (!appId || !type || !key) return res.status(400).json({ error: 'missing' });

  const doc = await prisma.applicationDocument.create({ data: { appId, type, url: key } });
  return res.status(200).json(doc);
}
