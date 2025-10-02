import { prisma } from "../../../../api/_db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await prisma.externalWebhookEvent.create({ data: { provider: 'pabbly', payload: body } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('pabbly webhook error', e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
