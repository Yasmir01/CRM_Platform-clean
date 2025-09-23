import { NextResponse } from "next/server";
import { prisma } from "../../../../../../pages/api/_db";
import { getSession } from "../../../../../lib/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const account = await prisma.account.findUnique({ where: { id: params.id } });
    return NextResponse.json(account);
  } catch (e) {
    console.error('Failed to fetch account', e);
    return NextResponse.json({ error: 'Failed to fetch account' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(req);
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const updated = await prisma.account.update({
      where: { id: params.id },
      data: {
        ccFinanceOnResend: body.ccFinanceOnResend === null || body.ccFinanceOnResend === undefined ? null : Boolean(body.ccFinanceOnResend),
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error('Failed to update account', e);
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
  }
}
