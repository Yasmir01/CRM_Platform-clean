import type { VercelRequest } from '@vercel/node';
import { rateLimit as coreRateLimit } from '../src/utils/rateLimit';

export async function rateLimit(req: VercelRequest, key: string, limit = 60, windowMs = 60_000) {
  const ip = ((req.headers['x-forwarded-for'] as string) || '').split(',')[0]?.trim() || (req.socket as any).remoteAddress || 'unknown';
  const { allowed, remaining } = coreRateLimit(ip, key, limit, windowMs);
  return { ok: allowed, remaining } as const;
}
