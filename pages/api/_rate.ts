import type { VercelRequest } from '@vercel/node';

const BUCKET: Record<string, { count: number; resetAt: number }> = {};
const WINDOW_MS = 60_000;
const LIMIT = 30;

export async function rateLimit(req: VercelRequest, key: string) {
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
  const k = `${key}:${ip}`;
  const now = Date.now();
  const b = BUCKET[k] ?? { count: 0, resetAt: now + WINDOW_MS };
  if (now > b.resetAt) {
    b.count = 0;
    b.resetAt = now + WINDOW_MS;
  }
  b.count++;
  BUCKET[k] = b;
  return { ok: b.count <= LIMIT } as const;
}
