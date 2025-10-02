import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { ensurePermission } from '../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });

  try {
    const orgs = await prisma.organization.findMany({
      include: {
        users: {
          where: { role: 'ADMIN' as any },
          select: { id: true, email: true, name: true },
        },
        settings: { select: { exportSchedule: true } },
      },
    });
    return res.status(200).json(orgs);
  } catch (e: any) {
    console.error('superadmin/orgs error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
