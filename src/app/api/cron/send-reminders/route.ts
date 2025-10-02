<<<<<<< HEAD
import { prisma } from "../../../../api/_db";
=======
import { prisma } from "../../../../pages/api/_db";
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
import { sendReminderNow } from "@/lib/reminderWorker";

export async function GET() {
  const now = new Date();
  const due = await prisma.reminder.findMany({ where: { status: 'pending', acknowledged: false, sendAt: { lte: now } }, take: 200 });
  for (const r of due) {
    try {
      await sendReminderNow(r.id);
      if (r.repeat && r.repeat !== 'none') {
        let next: Date | null = null;
        if (r.repeat === 'daily') {
          next = new Date(r.sendAt);
          next.setDate(next.getDate() + 1);
        } else if (r.repeat === 'weekly') {
          next = new Date(r.sendAt);
          next.setDate(next.getDate() + 7);
        }
        if (next) {
          await prisma.reminder.update({ where: { id: r.id }, data: { sendAt: next, status: 'pending', acknowledged: false } });
        }
      }
    } catch (e) {
      console.error('sendReminder error', e);
      await prisma.reminder.update({ where: { id: r.id }, data: { attempts: { increment: 1 }, status: 'failed' } });
    }
  }
  return new Response(JSON.stringify({ ok: true, processed: due.length }), { headers: { 'Content-Type': 'application/json' } });
}
