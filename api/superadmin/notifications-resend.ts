import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { ensurePermission } from '../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });

  const id = String((req.query?.id as string) || '');
  if (!id) return res.status(400).json({ error: 'id required' });

  try {
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif) return res.status(404).json({ error: 'Not found' });

    const createdBy = String((user as any).sub || (user as any).id || '');
    await prisma.notification.create({
      data: {
        title: notif.title,
        message: notif.message,
        audience: notif.audience,
        createdBy,
      },
    });

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ error: 'failed' });
  }
}
