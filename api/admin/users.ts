import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { ensurePermission } from '../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const user = ensurePermission(req, res, '*');
      if (!user) return;
      const id = (req.query.id as string) || '';
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const u = await prisma.user.findUnique({ where: { id } });
      const perms = (u?.permissions || '').split(',').map((p) => p.trim()).filter(Boolean);
      return res.status(200).json({ id, permissions: perms });
    }

    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e: any) {
    console.error('admin/users GET error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
