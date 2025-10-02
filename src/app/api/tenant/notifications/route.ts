import { NextResponse } from "next/server";
<<<<<<< HEAD
import { prisma } from '../../../../../api/_db';
=======
import { prisma } from '../../../../../pages/api/_db';
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
import { getSession } from '../../../../lib/auth';

export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session?.user?.tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const notifications = await prisma.notification.findMany({ where: { tenantId: session.user.tenantId }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(notifications);
}

// optional: mark as read
export async function POST(req: Request) {
  const session = await getSession(req);
  if (!session?.user?.tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id } = body || {};
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const note = await prisma.notification.findUnique({ where: { id } });
  if (!note || note.tenantId !== session.user.tenantId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.notification.update({ where: { id }, data: { read: true } });
  return NextResponse.json(updated);
}
