import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../src/utils/authz';
import { prisma } from '../_db';
import { safeParse } from '../../src/utils/safeJson';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;

  // Only super admins allowed
  const role = String((user as any).role || '').toLowerCase();
  if (!role.includes('super')) return res.status(403).json({ error: 'forbidden' });

  try {
    if (req.method === 'GET') {
      const roles = await prisma.role.findMany({ orderBy: { createdAt: 'desc' } });
      return res.status(200).json(roles);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? safeParse(req.body, {}) : (req.body || {});
      const name = String(body.name || '').trim();
      const permissions = body.permissions || {};
      if (!name) return res.status(400).json({ error: 'missing name' });
      const created = await prisma.role.create({ data: { name, permissions } as any });
      return res.status(200).json(created);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e: any) {
    console.error('admin/roles error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
