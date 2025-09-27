import { NextResponse } from 'next/server';
import { prisma } from '../../../../../pages/api/_db';
import { getSession } from '../../../../lib/auth';

export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session?.user || session.user.role !== 'TENANT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await prisma.tenant.findUnique({ where: { userId: session.user.id } });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const payments = await prisma.payment.findMany({ where: { tenantId: tenant.id }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(payments);
}

export async function POST(req: Request) {
  // optional: allow creating a payment record (used by webhook normally)
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}
