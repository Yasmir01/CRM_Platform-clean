import limiter from './rateLimiter';
import { NextResponse } from 'next/server';

export function withRateLimit(handler: any, opts: any = {}) {
  const { keyPrefix = 'global' } = opts;

  return async (req: Request, context?: any) => {
    try {
      const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '') as string;
      const key = `${keyPrefix}:${ip || 'unknown'}`;
      await limiter.consume(key, 1);
    } catch (rlRejected: any) {
      // log and return 429
      // eslint-disable-next-line no-console
      console.warn('rate limit exceeded', rlRejected);
      return new NextResponse(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers: { 'Content-Type': 'application/json' } });
    }

    try {
      return await handler(req, context);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('handler error', err);
      return new NextResponse(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
  };
}
