import { NextResponse } from 'next/server';
<<<<<<< HEAD
import { prisma } from '../../../../../../api/_db';
=======
import { prisma } from '../../../../../../pages/api/_db';
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
import { getSession } from '../../../../../lib/auth';
import { sendEmail } from '../../../../../lib/mailer';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession(req);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!['SUPER_ADMIN', 'ADMIN', 'OWNER'].includes(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const ticket = await prisma.supportTicket.findUnique({ where: { id: params.id }, include: { tenant: true } });
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const message = await prisma.supportMessage.create({ data: { ticketId: ticket.id, senderId: session.user.id, senderName: session.user.name || 'Admin', body: body.body || '' } });

  // update ticket status
  await prisma.supportTicket.update({ where: { id: ticket.id }, data: { status: 'PENDING' } });

  // notify tenant
  if (ticket.tenant?.email) {
    try {
      await sendEmail({ to: ticket.tenant.email, subject: `Update on your support ticket: ${ticket.subject}`, text: body.body || '' });
    } catch (e) {
      console.warn('Failed to notify tenant', e);
    }
  }

  return NextResponse.json({ ok: true, message });
}
