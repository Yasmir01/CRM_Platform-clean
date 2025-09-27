import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_db';
import { getUserOr401 } from '../src/utils/authz';
import { ensurePermission } from '../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const user = getUserOr401(req, res);
      if (!user) return;
      const orgId = String((user as any).orgId || '');
      if (!orgId) return res.status(400).json({ error: 'Missing orgId' });

      const settings = await prisma.orgSettings.findUnique({ where: { orgId } });
      return res.status(200).json(settings || null);
    }

    if (req.method === 'PATCH') {
      const user = ensurePermission(req, res, 'users:manage');
      if (!user) return;

      const orgId = String((user as any).orgId || '');
      if (!orgId) return res.status(400).json({ error: 'Missing orgId' });

      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const notifications = typeof body.notifications === 'boolean' ? body.notifications : undefined;
      if (notifications === undefined) return res.status(400).json({ error: 'Missing notifications boolean' });

      const updated = await prisma.orgSettings.upsert({
        where: { orgId },
        update: { notifications },
        create: { orgId, notifications },
      });

      return res.status(200).json(updated);
    }

    res.setHeader('Allow', 'GET, PATCH');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e: any) {
    console.error('org-settings handler error', e?.message || e);
    return res.status(500).json({ error: 'Server error' });
  }
}
