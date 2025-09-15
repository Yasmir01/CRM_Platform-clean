import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const subscriberId = url.searchParams.get('subscriberId');

    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (subscriberId && subscriberId !== 'ALL') where.subscriberId = subscriberId;

    const leads = await prisma.lead.findMany({
      where,
      include: { subscriber: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return new Response(JSON.stringify({ leads }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('admin leads GET error', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
