import { NextResponse } from 'next/server';
<<<<<<< HEAD
import { prisma } from '../../../../../api/_db';
=======
import { prisma } from '../../../../../pages/api/_db';
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
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
