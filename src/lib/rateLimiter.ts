// src/lib/rateLimiter.ts
import { kv } from '@vercel/kv';

// Fallback in-memory map if kv isn't configured
const localBuckets = new Map<string, { ts: number; count: number }>();

export async function rateLimit(key: string, limit = 5, windowSec = 60) {
  try {
    if (kv) {
      const now = Math.floor(Date.now() / 1000);
      const bucket = `rate:${key}:${Math.floor(now / windowSec)}`;
      const current = (await kv.incr(bucket)) || 0;
      if (current === 1) await kv.expire(bucket, windowSec);
      if (current > limit) throw new Error('rate_limited');
      return current;
    }
  } catch (e) {
    // fall through to local
    console.warn('kv rateLimit failed, falling back to local in-memory limiter', e?.message || e);
  }

  // Local fallback
  const now = Date.now();
  const bucketKey = `${key}:${Math.floor(now / (windowSec * 1000))}`;
  const entry = localBuckets.get(bucketKey) || { ts: now, count: 0 };
  entry.count += 1;
  localBuckets.set(bucketKey, entry);
  if (entry.count > limit) throw new Error('rate_limited');
  return entry.count;
}
