import { NextResponse } from "next/server";
import { prisma } from '../../../../../api/_db';
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
