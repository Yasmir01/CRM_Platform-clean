import { NextResponse } from 'next/server';
import { prisma } from '../../../../../api/_db';
import { getSession } from '../../../../lib/auth';

export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session?.user || session.user.role !== 'TENANT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // find tenant record by user id
  const tenant = await prisma.tenant.findUnique({ where: { userId: session.user.id } });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const leases = await prisma.lease.findMany({ where: { tenantId: tenant.id, active: true }, include: { property: true } });
  const payments = await prisma.payment.findMany({ where: { tenantId: tenant.id }, orderBy: { createdAt: 'desc' }, take: 12 });
  const reminders = await prisma.reminder.findMany({ where: { tenantId: tenant.id }, orderBy: { sendAt: 'desc' }, take: 10 });
  const tickets = await prisma.supportTicket.findMany({ where: { tenantId: tenant.id }, orderBy: { updatedAt: 'desc' }, take: 10 });

  return NextResponse.json({ tenant: { id: tenant.id, name: tenant.name, email: tenant.email }, lease: leases[0] || null, payments, reminders, tickets });
}
