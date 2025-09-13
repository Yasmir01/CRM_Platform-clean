import { NextResponse } from "next/server";
import { prisma } from '../../../../../api/_db';
import { getSession } from '../../../../lib/auth';

export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session?.user?.tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const history = await prisma.historyEvent.findMany({ where: { tenantId: session.user.tenantId }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(history);
}

export async function POST(req: Request) {
  const session = await getSession(req);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const event = await prisma.historyEvent.create({ data: { tenantId: body.tenantId, type: body.type, details: body.details, metadata: body.metadata || null } });
  return NextResponse.json(event);
}
