import { prisma } from "../../../../api/_db";
import { createReminderLog } from "@/lib/reminderLog";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const messageSid = form.get("MessageSid") as string | null;
    const messageStatus = form.get("MessageStatus") as string | null;

    if (!messageSid) return NextResponse.json({ ok: false, error: "Missing MessageSid" }, { status: 400 });

    // Try to find the log that contains this SID in its response
    const log = await prisma.reminderLog.findFirst({ where: { response: { path: ["sid"], equals: messageSid } } });

    if (log) {
      await createReminderLog({
        reminderId: log.reminderId,
        initiatedBy: "twilio",
        channel: "sms",
        status: messageStatus || "unknown",
        note: "Twilio status callback",
        response: { messageSid, messageStatus },
      });
    } else {
      // unresolved - nothing to do, log for debugging
      console.warn("twilio-sms webhook: no matching reminderLog for sid", messageSid);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("twilio-sms webhook error", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
