import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session?.user?.subscriberId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status');

    const where: any = { subscriberId: session.user.subscriberId };
    if (status && status !== 'ALL') where.status = status;

    const leads = await prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' } });

    return new Response(JSON.stringify({ leads }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('subscriber leads GET error', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
