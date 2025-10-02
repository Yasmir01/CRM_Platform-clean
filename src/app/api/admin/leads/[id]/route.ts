import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(req);
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const { status, subscriberId } = body || {};
    if (!status && !subscriberId) return new Response(JSON.stringify({ error: 'Missing update fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } });

    const data: any = {};
    if (status) data.status = status;
    if (subscriberId) data.subscriberId = subscriberId;

    const lead = await prisma.lead.update({ where: { id: params.id }, data });

    return new Response(JSON.stringify({ success: true, lead }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('admin lead update error', err);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
