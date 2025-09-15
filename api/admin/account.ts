import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;

  const userId = String((user as any).sub || (user as any).id || '');
  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!dbUser) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      if (!dbUser.accountId) return res.status(200).json({});
      const account = await prisma.account.findUnique({ where: { id: dbUser.accountId } });
      return res.status(200).json(account || {});
    }

    if (req.method === 'POST') {
      // Only admins can update branding
      const role = String(dbUser.role || '').toUpperCase();
      if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });

      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      if (!dbUser.accountId) return res.status(400).json({ error: 'No account set for user' });

      const updated = await prisma.account.update({ where: { id: dbUser.accountId }, data: {
        name: body.name ?? undefined,
        logoUrl: body.logoUrl ?? undefined,
        address: body.address ?? undefined,
        phone: body.phone ?? undefined,
        email: body.email ?? undefined,
      } });

      return res.status(200).json(updated);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e: any) {
    console.error('admin account error', e?.message || e);
    return res.status(500).json({ error: 'Server error' });
  }
}
