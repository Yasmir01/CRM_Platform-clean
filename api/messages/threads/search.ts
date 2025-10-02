import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../../_db';
import { getUserOr401 } from '../../../../src/utils/authz';
import { normalizeRoleString } from '../../../../src/lib/messages/rules';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const userId = String((user as any).sub || (user as any).id);
    const q = String((req.query as any)?.q || '').trim();
    const roleQRaw = (req.query as any)?.role as string | undefined;
    const status = (req.query as any)?.status as string | undefined; // active | archived | escalated

    const where: any = { participants: { some: { userId } } };

    if (q) {
      where.OR = [
        { subject: { contains: q, mode: 'insensitive' as any } },
        { messages: { some: { body: { contains: q, mode: 'insensitive' as any } } } },
      ];
    }

    if (roleQRaw) {
      const role = normalizeRoleString(roleQRaw);
      where.participants = { some: { role } };
    }

    if (status === 'archived') {
      const archived = await prisma.archivedThread.findMany({ select: { threadId: true } });
      where.id = { in: archived.map((a) => a.threadId) };
    } else if (status === 'escalated') {
      const escalated = await prisma.messageEscalation.findMany({ select: { threadId: true } });
      where.id = { in: escalated.map((e) => e.threadId) };
    } else if (status === 'active') {
      const archived = await prisma.archivedThread.findMany({ select: { threadId: true } });
      if (archived.length) where.id = { notIn: archived.map((a) => a.threadId) };
    }

    const threads = await prisma.messageThread.findMany({
      where,
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    return res.status(200).json(threads);
  } catch (e: any) {
    console.error('threads search error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
