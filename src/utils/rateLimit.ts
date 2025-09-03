type Bucket = { count: number; reset: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(ip: string, key: string, limit = 60, windowMs = 60_000) {
  const id = `${ip}:${key}`;
  const now = Date.now();
  const bucket = buckets.get(id) || { count: 0, reset: now + windowMs };
  if (now > bucket.reset) {
    bucket.count = 0;
    bucket.reset = now + windowMs;
  }
  bucket.count += 1;
  buckets.set(id, bucket);
  const remaining = Math.max(0, limit - bucket.count);
  const allowed = bucket.count <= limit;
  return { allowed, remaining, reset: bucket.reset };
}
