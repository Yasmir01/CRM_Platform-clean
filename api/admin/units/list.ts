import type { VercelRequest, VercelResponse } from '@vercel/node';
import { defineHandler } from '../../_handler';
import { prisma } from '../../_db';

export default defineHandler({
  methods: ['GET'],
  roles: ['ADMIN', 'SUPER_ADMIN'],
  limitKey: 'units:list',
  fn: async ({ req, res }) => {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const page = Math.max(0, Number(url.searchParams.get('page') ?? 0));
    const size = Math.min(100, Math.max(1, Number(url.searchParams.get('size') ?? 50)));

    const [rows, total] = await Promise.all([
      prisma.unit.findMany({
        skip: page * size,
        take: size,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.unit.count(),
    ]);

    (res as VercelResponse).json({ rows, total });
  },
});
