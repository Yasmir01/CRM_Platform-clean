import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { ensurePermission } from '../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = String(req.query.id || '');
  if (!id) return res.status(400).json({ error: 'Missing id' });

  if (req.method === 'PATCH') {
    const user = ensurePermission(req, res, 'users:manage');
    if (!user) return;
    const userId = String((user as any).sub || (user as any).id || '');
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser) return res.status(401).json({ error: 'Unauthorized' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const allowExport = typeof body.allowExport === 'boolean' ? body.allowExport : undefined;
    if (allowExport === undefined) return res.status(400).json({ error: 'Missing allowExport boolean' });

    const setting = await prisma.orgSettings.findUnique({ where: { id } });
    if (!setting) return res.status(404).json({ error: 'OrgSettings not found' });

    // only SUPER_ADMIN or org admin can update
    if (String(dbUser.role || '').toUpperCase() !== 'SUPER_ADMIN' && dbUser.orgId !== setting.orgId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await prisma.orgSettings.update({ where: { id }, data: { allowExport } });
    return res.status(200).json(updated);
  }

  res.setHeader('Allow', 'PATCH');
  return res.status(405).json({ error: 'Method Not Allowed' });
}
