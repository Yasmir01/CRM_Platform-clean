import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z, ZodSchema } from 'zod';
import { getUserOr401 } from '../src/utils/authz';
import { rateLimit } from './_rate';

export function defineHandler<T extends ZodSchema<any>>(opts: {
  methods: Array<'GET' | 'POST' | 'PATCH' | 'DELETE'>;
  bodySchema?: T;
  roles?: string[];
  limitKey?: string;
  fn: (ctx: { req: VercelRequest; res: VercelResponse; user: any; body: z.infer<T> | any }) => Promise<void>;
}) {
  return async (req: VercelRequest, res: VercelResponse) => {
    const method = (req.method || 'GET') as any;
    if (!opts.methods.includes(method)) {
      res.setHeader('Allow', opts.methods.join(', '));
      return res.status(405).json({ error: 'method_not_allowed' });
    }

    if (opts.limitKey) {
      const limited = await rateLimit(req, opts.limitKey);
      if (!limited.ok) return res.status(429).json({ error: 'rate_limited' });
    }

    const user = getUserOr401(req, res);
    if (!user) return;

    let body: any = {};
    if (opts.bodySchema && method !== 'GET') {
      try {
        const raw = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {});
        body = opts.bodySchema.parse(raw);
      } catch (e: any) {
        return res.status(400).json({ error: 'invalid_body', details: e?.errors || String(e?.message || 'invalid') });
      }
    }

    try {
      await opts.fn({ req, res, user, body });
    } catch (e: any) {
      console.error('api_error', { route: req.url, err: e?.message || e });
      return res.status(500).json({ error: 'internal_error' });
    }
  };
}
