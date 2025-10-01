import { PrismaClient } from "@prisma/client";
import { sendToUsers } from "../services/push";
import { pathToFileURL } from "url";

const prisma = new PrismaClient();

export async function sendRentReminders(daysAhead = 3) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + daysAhead);

  const upcoming = await prisma.rentSchedule.findMany({
    where: { isPaid: false, dueOn: { gte: start, lt: end } },
    include: { lease: { include: { participants: true } } },
  });

  for (const s of upcoming) {
    const tenantUserId = s.lease.participants.find((p) => p.roleLabel?.toUpperCase() === "TENANT")?.userId;
    if (!tenantUserId) continue;
    await sendToUsers([tenantUserId], {
      title: "Rent due soon",
      body: `Your rent of $${s.amount.toString()} is due on ${new Date(s.dueOn).toLocaleDateString()}.`,
      data: { scheduleId: s.id },
    });
  }
  return upcoming.length;
}

const isMain = (() => {
  try {
    const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
    return import.meta.url === entry;
  } catch {
    return false;
  }
})();

if (isMain) {
  (async () => {
    try {
      const c = await sendRentReminders();
      // eslint-disable-next-line no-console
      console.log("Sent reminders:", c);
      process.exit(0);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      process.exit(1);
    }
  })();
}
