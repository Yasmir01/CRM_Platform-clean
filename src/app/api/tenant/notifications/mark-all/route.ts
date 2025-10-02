import { NextResponse } from "next/server";
<<<<<<< HEAD
import { prisma } from '../../../../../api/_db';
=======
import { prisma } from '../../../../../pages/api/_db';
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
import { getSession } from '../../../../lib/auth';

export async function POST(req: Request) {
  const session = await getSession(req);
  if (!session?.user?.tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.notification.updateMany({ where: { tenantId: session.user.tenantId, read: false }, data: { read: true } });
  return NextResponse.json({ success: true });
}
