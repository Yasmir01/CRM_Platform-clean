import { NextResponse } from "next/server";
import { prisma } from "../../../../../pages/api/_db";
import { getSession } from "../../../../lib/auth";

export async function GET(req: Request) {
  try {
    const settings = await prisma.globalSettings.findUnique({ where: { id: 'default' } });
    return NextResponse.json(settings);
  } catch (e) {
    console.error('Failed to fetch settings', e);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const updated = await prisma.globalSettings.upsert({
      where: { id: 'default' },
      update: {
        ccFinanceOnResend: Boolean(body.ccFinanceOnResend),
        financeEmail: body.financeEmail || null,
      },
      create: {
        id: 'default',
        ccFinanceOnResend: Boolean(body.ccFinanceOnResend),
        financeEmail: body.financeEmail || null,
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error('Failed to update settings', e);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
