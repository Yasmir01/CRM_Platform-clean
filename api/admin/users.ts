import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { ensurePermission } from '../../src/lib/authorize';
import { permissions as roleDefaults } from '../../src/lib/permissions';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const user = ensurePermission(req, res, '*');
      if (!user) return;

      const id = (req.query.id as string | undefined) || undefined;

      // If an id is provided, return that user's explicit permissions (for editor)
      if (id) {
        const u = await prisma.user.findUnique({ where: { id }, select: { id: true, permissions: true } });
        const perms = (u?.permissions || '')
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean);
        return res.status(200).json({ id, permissions: perms });
      }

      // Otherwise, list all users with their active permissions (overrides or role defaults)
      const users = await prisma.user.findMany({
        select: { id: true, email: true, role: true, permissions: true, name: true },
      });

      const enriched = users.map((u) => {
        let activePerms: string[] = [];
        if (u.permissions) {
          activePerms = u.permissions.split(',').map((p) => p.trim()).filter(Boolean);
        } else {
          // @ts-expect-error role enum string index
          activePerms = (roleDefaults as any)[u.role] || [];
        }
        return { ...u, activePerms };
      });

      return res.status(200).json(enriched);
    }

    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e: any) {
    console.error('admin/users GET error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
