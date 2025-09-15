import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const subs = await prisma.subscriber.findMany({ select: { id: true, name: true, email: true }, orderBy: { name: 'asc' } });

    // Attach a primaryUserId when possible (match by email)
    const subscribers = await Promise.all(subs.map(async (s: any) => {
      let primaryUserId: string | null = null;
      try {
        const user = await prisma.user.findFirst({ where: { email: s.email }, select: { id: true } });
        if (user) primaryUserId = user.id;
      } catch (e) {
        // ignore
      }
      return { id: s.id, name: s.name, primaryUserId };
    }));

    return new Response(JSON.stringify({ subscribers }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('admin subscribers GET error', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
