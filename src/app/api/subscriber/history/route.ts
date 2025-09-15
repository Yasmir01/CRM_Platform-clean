import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const IMPOSTER_ACTIONS = ['ImpersonationStarted', 'ImpersonationStopped'];

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session?.user?.subscriberId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const where: any = {
      subscriberId: session.user.subscriberId,
      NOT: { action: { in: IMPOSTER_ACTIONS } },
    };

    const history = await prisma.history.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true } }, subscriber: { select: { id: true, name: true } } },
      take: 1000,
    });

    return new Response(JSON.stringify({ history }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('subscriber history GET error', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
