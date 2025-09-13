import { NextResponse } from 'next/server';
import { prisma } from '../../../../../api/_db';
import { getSession } from '../../../../lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await prisma.tenant.findUnique({ where: { userId: session.user.id } });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const reminders = await prisma.reminder.findMany({ where: { tenantId: tenant.id }, orderBy: { sendAt: 'desc' } });
  return NextResponse.json({ reminders });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { reminderId } = body || {};
  if (!reminderId) return NextResponse.json({ error: 'Missing reminderId' }, { status: 400 });

  const tenant = await prisma.tenant.findUnique({ where: { userId: session.user.id } });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const reminder = await prisma.reminder.findUnique({ where: { id: reminderId } });
  if (!reminder) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (reminder.tenantId !== tenant.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const updated = await prisma.reminder.update({ where: { id: reminderId }, data: { acknowledged: true } });
  return NextResponse.json({ ok: true, reminder: updated });
}
