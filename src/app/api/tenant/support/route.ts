import { NextResponse } from 'next/server';
import { prisma } from '../../../../../pages/api/_db';
import { getSession } from '../../../../lib/auth';
import { sendEmail } from '../../../../lib/mailer';
import { verifyRecaptcha } from '../../../../lib/recaptcha';
import { rateLimit } from '../../../../lib/rateLimiter';

export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await prisma.tenant.findUnique({ where: { userId: session.user.id } });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const tickets = await prisma.supportTicket.findMany({ where: { tenantId: tenant.id }, include: { messages: { orderBy: { createdAt: 'asc' } } }, orderBy: { updatedAt: 'desc' } });
  return NextResponse.json({ tickets });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subject, description, priority, recaptchaToken } = body || {};

    // basic validation
    if (!subject) return NextResponse.json({ error: 'Missing subject' }, { status: 400 });

    // rate limit per IP
    const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown').split(',')[0].trim();
    await rateLimit(ip, 5, 60);

    // recaptcha
    const human = await verifyRecaptcha(recaptchaToken || '');
    if (!human) return NextResponse.json({ error: 'Recaptcha failed' }, { status: 400 });

    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tenant = await prisma.tenant.findUnique({ where: { userId: session.user.id } });
    if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

    const ticket = await prisma.supportTicket.create({ data: { tenantId: tenant.id, accountId: tenant.accountId || undefined, subject, description: description || null, priority: priority || 'MEDIUM', status: 'OPEN' } });

    await prisma.supportMessage.create({ data: { ticketId: ticket.id, senderId: session.user.id, senderName: tenant.name, body: description || '' } });

    // notify admins
    const admins = await prisma.user.findMany({ where: { accountId: tenant.accountId, role: { in: ['OWNER', 'ADMIN'] } }, select: { email: true } });
    const emails = admins.map((a) => a.email).filter(Boolean);
    if (emails.length) {
      try {
        await sendEmail({ to: emails.join(','), subject: `New Support Ticket: ${subject}`, text: `Tenant ${tenant.name} opened a ticket: ${subject}\n\n${description || ''}` });
      } catch (e) {
        console.warn('notify admins failed', e);
      }
    }

    return NextResponse.json({ ok: true, ticketId: ticket.id }, { status: 201 });
  } catch (err: any) {
    if (err?.message === 'rate_limited') return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    console.error('create ticket error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
