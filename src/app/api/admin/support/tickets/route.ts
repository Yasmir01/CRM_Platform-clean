import { NextResponse } from 'next/server';
import { prisma } from '../../../../../pages/api/_db';
import { getSession, requireSuperAdmin } from '../../../../lib/auth';

export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    requireSuperAdmin(session);
  } catch (e) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tickets = await prisma.supportTicket.findMany({ include: { messages: { orderBy: { createdAt: 'asc' } } }, orderBy: { updatedAt: 'desc' } });
  return NextResponse.json({ tickets });
}
