import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_db';
import { getUserOr401 } from '../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = getUserOr401(req, res);
  if (!user) return;
  const userId = String((user as any).sub || (user as any).id || '');
  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!dbUser) return res.status(401).json({ error: 'Unauthorized' });
  if (String(dbUser.role || '').toUpperCase() !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });

  try {
    const q = String((req.query as any).search || '').trim();
    const status = String((req.query as any).status || 'all').toLowerCase();
    const from = (req.query as any).from as string | undefined;
    const to = (req.query as any).to as string | undefined;
    const take = Math.min(500, Number((req.query as any).take || 100));

    const where: any = {};

    if (status === 'sent') where.alertSent = true;
    if (status === 'suppressed') where.alertSent = false;

    if (from || to) {
      where.startedAt = {};
      if (from) {
        const fromDate = new Date(from);
        if (!isNaN(fromDate.getTime())) where.startedAt.gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        if (!isNaN(toDate.getTime())) where.startedAt.lte = toDate;
      }
    }

    if (q) {
      const qLower = q.toLowerCase();
      where.OR = [
        { superAdminId: { contains: qLower, mode: 'insensitive' } },
        { subscriberId: { contains: qLower, mode: 'insensitive' } },
        { superAdmin: { email: { contains: qLower, mode: 'insensitive' } } },
        { subscriber: { name: { contains: qLower, mode: 'insensitive' } } },
      ];
    }

    const logs = await prisma.impersonationLog.findMany({
      where,
      include: {
        superAdmin: { select: { id: true, email: true, name: true } },
        subscriber: { select: { id: true, email: true, name: true, companyName: true } },
        targetUser: { select: { id: true, email: true, name: true } },
      },
      orderBy: { startedAt: 'desc' },
      take: take || 100,
    });

    return res.status(200).json(logs);
  } catch (err: any) {
    console.error('Error fetching impersonation logs:', err?.message || err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
