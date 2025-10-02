import { NextResponse } from "next/server";
<<<<<<< HEAD
import { prisma } from '../../../../../api/_db';
=======
import { prisma } from '../../../../../pages/api/_db';
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
import { getSession } from '../../../../lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession(req);
  if (!session?.user?.tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const notification = await prisma.notification.findUnique({ where: { id: params.id } });
  if (!notification || notification.tenantId !== session.user.tenantId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const updated = await prisma.notification.update({ where: { id: params.id }, data: { read: true } });
  return NextResponse.json(updated);
}
