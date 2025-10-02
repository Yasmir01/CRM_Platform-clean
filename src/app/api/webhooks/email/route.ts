<<<<<<< HEAD
import { prisma } from "../../../../api/_db";
=======
import { prisma } from "../../../../pages/api/_db";
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
import { createReminderLog } from "@/lib/reminderLog";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const provider = body.provider || body.event && body.event.provider || 'email-provider';
    const messageId = body.messageId || body.mail && body.mail.messageId || null;
    const event = body.event || body.status || null;

    if (!messageId) {
      console.warn('email webhook: missing messageId', body);
      return NextResponse.json({ ok: true });
    }

    // Try to find an existing log that stores this messageId in response
    const log = await prisma.reminderLog.findFirst({ where: { response: { path: ['messageId'], equals: messageId } } });

    if (log) {
      await createReminderLog({
        reminderId: log.reminderId,
        initiatedBy: provider,
        channel: 'email',
        status: event || 'unknown',
        response: body,
        note: `Provider ${provider} webhook event ${event}`,
      });
    } else {
      console.warn('email webhook: could not resolve messageId to reminderLog', messageId);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('email webhook error', e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
