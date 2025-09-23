import { NextResponse } from "next/server";
import { getSession, requireSuperAdmin } from "../../../../lib/auth";
import { prisma } from "../../../../../pages/api/_db";

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      requireSuperAdmin(session);
    } catch (e) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoices = await prisma.billingInvoice.findMany({ include: { account: true }, orderBy: { createdAt: "desc" } });

    return NextResponse.json(invoices);
  } catch (e) {
    console.error("Failed to fetch admin invoices", e);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}
