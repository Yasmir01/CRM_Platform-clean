import { NextResponse } from "next/server";
import { prisma } from '../../../../../api/_db';
import { getSession } from '../../../../lib/auth';

export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");
  const companyId = searchParams.get("companyId");
  const type = searchParams.get("type");

  const activity = await prisma.historyEvent.findMany({
    where: {
      ...(tenantId ? { tenantId } : {}),
      ...(companyId ? { companyId } : {}),
      ...(type ? { type } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(activity);
}
