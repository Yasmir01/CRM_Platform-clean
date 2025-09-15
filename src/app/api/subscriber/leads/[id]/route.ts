import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(req);
    if (!session?.user?.subscriberId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const { status } = body || {};
    if (!status) return new Response(JSON.stringify({ error: 'Missing status' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    const result = await prisma.lead.updateMany({ where: { id: params.id, subscriberId: session.user.subscriberId }, data: { status } });

    if (result.count === 0) {
      return new Response(JSON.stringify({ error: 'Not found or not authorized' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('subscriber lead update error', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
