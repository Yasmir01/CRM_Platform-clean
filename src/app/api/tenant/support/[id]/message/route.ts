import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../api/_db';
import { getSession } from '../../../../../lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession(req);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await prisma.tenant.findUnique({ where: { userId: session.user.id } });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const ticket = await prisma.supportTicket.findUnique({ where: { id: params.id } });
  if (!ticket || ticket.tenantId !== tenant.id) return NextResponse.json({ error: 'Not allowed' }, { status: 403 });

  const body = await req.json();
  const msg = await prisma.supportMessage.create({ data: { ticketId: ticket.id, senderId: session.user.id, senderName: tenant.name, body: body.body || '' } });

  await prisma.supportTicket.update({ where: { id: ticket.id }, data: { status: 'PENDING' } });

  return NextResponse.json({ ok: true, message: msg }, { status: 201 });
}
