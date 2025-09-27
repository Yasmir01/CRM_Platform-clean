import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../pages/api/_db';
import { getSession } from '../../../../../lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession(req);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // require account admin/owner role - simple check (role in user)
  if (!['SUPER_ADMIN', 'ADMIN', 'OWNER'].includes(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const ticket = await prisma.supportTicket.findUnique({ where: { id: params.id }, include: { messages: { orderBy: { createdAt: 'asc' } } } });
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ ticket });
}
