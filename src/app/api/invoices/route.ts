import { NextResponse } from "next/server";
import { parse } from "cookie";
import jwt from "jsonwebtoken";
import { prisma } from "../../../../api/_db";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = cookieHeader ? parse(cookieHeader) : {};
    const raw = cookies.sid as string | undefined;
    if (!raw) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const JWT_SECRET = process.env.SESSION_JWT_SECRET as string;
    if (!JWT_SECRET) return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });

    let payload: any;
    try {
      payload = jwt.verify(raw, JWT_SECRET) as any;
    } catch (e) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = payload.accountId || payload.orgId || payload.account || payload.account_id;
    if (!accountId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const invoices = await prisma.billingInvoice.findMany({ where: { accountId: String(accountId) }, orderBy: { createdAt: "desc" } });

    return NextResponse.json(invoices);
  } catch (e) {
    console.error("Failed to fetch invoices", e);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}
