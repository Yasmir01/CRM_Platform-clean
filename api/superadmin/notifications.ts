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
    const search = (req.query?.search as string) || '';
    const audience = (req.query?.audience as string) || '';
    const fromStr = (req.query?.from as string) || '';
    const toStr = (req.query?.to as string) || '';

    const and: any[] = [];
    if (search) {
      and.push({ OR: [
        { title: { contains: search, mode: 'insensitive' as any } },
        { message: { contains: search, mode: 'insensitive' as any } },
      ]});
    }
    if (audience && audience !== 'ALL') {
      and.push({ audience });
    }
    if (fromStr) {
      const from = new Date(fromStr);
      if (!isNaN(from.getTime())) and.push({ createdAt: { gte: from } });
    }
    if (toStr) {
      const to = new Date(toStr);
      if (!isNaN(to.getTime())) and.push({ createdAt: { lte: to } });
    }

    const notifications = await prisma.notification.findMany({
      where: and.length ? { AND: and } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return res.status(200).json(notifications);
  } catch (e: any) {
    console.error('superadmin/notifications error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
