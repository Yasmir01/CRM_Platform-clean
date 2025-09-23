import { NextResponse } from "next/server";
import { prisma } from '../../../../../pages/api/_db';
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
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const createdAtFilter = (from || to)
    ? {
        createdAt: {
          ...(from ? { gte: new Date(from) } : {}),
          ...(to ? { lte: new Date(to) } : {}),
        },
      }
    : {};

  const activity = await prisma.historyEvent.findMany({
    where: {
      ...(tenantId ? { tenantId } : {}),
      ...(companyId ? { companyId } : {}),
      ...(type ? { type } : {}),
      ...createdAtFilter,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(activity);
}
