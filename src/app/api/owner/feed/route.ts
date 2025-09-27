import { NextResponse } from "next/server";
import { prisma } from '../../../../../pages/api/_db';
import { getSession } from '../../../../lib/auth';

export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session?.user?.ownerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("propertyId");
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

  const feed = await prisma.historyEvent.findMany({
    where: {
      ownerId: session.user.ownerId,
      ...(propertyId ? { propertyId } : {}),
      ...(type ? { type } : {}),
      ...createdAtFilter,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(feed);
}
