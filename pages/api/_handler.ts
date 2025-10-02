import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z, ZodSchema } from 'zod';
import { getUserOr401 } from '../src/utils/authz';
import { rateLimit } from './_rate';
import { safeParse } from '../src/utils/safeJson';

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

    if (opts.roles && opts.roles.length) {
      const rawRoles: string[] = Array.isArray((user as any).roles)
        ? (user as any).roles
        : (user as any).role
        ? [String((user as any).role)]
        : [];
      const norm = (s: string) => String(s || '')
        .toUpperCase()
        .replace(/[^A-Z]/g, '') // remove non letters
        .replace('SUPERADMIN', 'SUPERADMIN')
        .replace('ADMIN', 'ADMIN');
      const have = new Set(rawRoles.map(norm));
      const needOk = opts.roles.some((r) => have.has(norm(r)));
      if (!needOk) return res.status(403).json({ error: 'forbidden' });
    }

    let body: any = {};
    if (opts.bodySchema && method !== 'GET') {
      try {
        const raw = typeof req.body === 'string' ? safeParse(req.body, {}) : (req.body ?? {});
        body = opts.bodySchema.parse(raw);
      } catch (e: any) {
        return res.status(400).json({ error: 'invalid_body', details: e?.errors || String(e?.message || 'invalid') });
      }
    }

    try {
      // Run handler with session available in async local storage so prisma middleware
      // can access the current user's session.
      const { runWithSession } = await import('../src/lib/sessionContext');
      await runWithSession(user || null, async () => {
        await opts.fn({ req, res, user, body });
      });
    } catch (e: any) {
      console.error('api_error', { route: req.url, err: e?.message || e });
      return res.status(500).json({ error: 'internal_error' });
    }
  };
}
