let limiter: any = null;

try {
  // try to use rate-limiter-flexible with Redis if available
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { RateLimiterRedis, RateLimiterMemory } = require('rate-limiter-flexible');
  // import redis client if configured
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const redisClient = require('./redis').redisClient;

  const points = parseInt(process.env.RATE_LIMIT_POINTS || '10', 10);
  const duration = parseInt(process.env.RATE_LIMIT_DURATION || '60', 10);
  const blockDuration = parseInt(process.env.RATE_LIMIT_LOCK_TIME || '60', 10);

  if (redisClient) {
    limiter = new RateLimiterRedis({
      storeClient: redisClient,
      points,
      duration,
      keyPrefix: 'rlf',
      inmemoryBlockOnConsumed: points * 2,
      inmemoryBlockDuration: blockDuration,
    });
  } else {
    limiter = new RateLimiterMemory({
      points,
      duration,
      keyPrefix: 'rlf-mem',
    });
  }
} catch (e) {
  // rate-limiter-flexible not installed — fallback to a simple in-memory limiter
  // eslint-disable-next-line no-console
  console.warn('rate-limiter-flexible not available, using simple in-memory fallback', e);

  const map = new Map<string, { points: number; resetAt: number }>();
  const points = parseInt(process.env.RATE_LIMIT_POINTS || '10', 10);
  const duration = parseInt(process.env.RATE_LIMIT_DURATION || '60', 10);

  limiter = {
    consume: async (key: string, cost = 1) => {
      const now = Date.now();
      const entry = map.get(key);
      if (!entry || entry.resetAt <= now) {
        map.set(key, { points: points - cost, resetAt: now + duration * 1000 });
        return { remainingPoints: points - cost };
      }
      if (entry.points - cost < 0) {
        const msBefore = entry.resetAt - now;
        const err: any = new Error('RateLimiterExceeded');
        err.msBeforeNext = msBefore;
        throw err;
      }
      entry.points -= cost;
      map.set(key, entry);
      return { remainingPoints: entry.points };
    },
    // convenience
    get: async (key: string) => map.get(key),
  };
}

export default limiter;
