import { NextResponse } from "next/server";
import { prisma } from "../../../../../../api/_db";
import { getSession } from "../../../../../lib/auth";
import { sendEmail } from "../../../../../lib/mailer";
import { generateInvoicePdf } from "../../../../../lib/invoicePdf";

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { invoiceId } = body || {};
    if (!invoiceId) return NextResponse.json({ error: "Missing invoiceId" }, { status: 400 });

    const invoice = await prisma.billingInvoice.findUnique({ where: { id: String(invoiceId) }, include: { account: true } });
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    // Try to find stored Stripe snapshot for precise regeneration
    const stripeEvent = await prisma.stripeEvent.findUnique({ where: { stripeId: invoice.stripeId } });

    const source = (stripeEvent && stripeEvent.data) ? stripeEvent.data : {
      id: invoice.stripeId,
      number: invoice.number,
      amount_due: invoice.amount,
      period_start: Math.floor(new Date(invoice.periodStart).getTime() / 1000),
      period_end: Math.floor(new Date(invoice.periodEnd).getTime() / 1000),
      customer_email: invoice.account?.email || undefined,
      customer_name: invoice.account?.name || undefined,
      lines: { data: [] },
    };

    const pdfBytes = await generateInvoicePdf(source, invoice.accountId);

    // Read global settings to determine CC/BCC behavior
    const settings = await prisma.globalSettings.findUnique({ where: { id: 'default' } });
    const cc = settings?.ccFinanceOnResend ? settings?.financeEmail : undefined;

    await sendEmail({
      to: invoice.account?.email ?? "billing@example.com",
      cc: cc || undefined,
      subject: `Invoice #${invoice.number} - ${invoice.account?.name ?? ""}`,
      text: "Here is a copy of your invoice.",
      attachments: [{ filename: `invoice-${invoice.number}.pdf`, content: Buffer.from(pdfBytes) }],
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Failed to resend invoice", e);
    return NextResponse.json({ error: "Failed to resend invoice" }, { status: 500 });
  }
}
