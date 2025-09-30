import { NextResponse } from "next/server";
import { prisma } from '../../../../../api/_db';
import { getSession } from '../../../../lib/auth';

export async function POST(req: Request) {
  const session = await getSession(req);
  if (!session?.user?.tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.notification.updateMany({ where: { tenantId: session.user.tenantId, read: false }, data: { read: true } });
  return NextResponse.json({ success: true });
}
