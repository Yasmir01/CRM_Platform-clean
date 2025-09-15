import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const subscriberId = url.searchParams.get('subscriberId');
    const search = url.searchParams.get('search');

    const where: any = {};
    if (action) where.action = action;
    if (subscriberId) where.subscriberId = subscriberId;
    if (search) {
      where.OR = [
        { details: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { subscriber: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const history = await prisma.history.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true, role: true } }, subscriber: { select: { id: true, name: true, email: true } } },
      take: 200,
    });

    return new Response(JSON.stringify({ history }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('admin history GET error', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
