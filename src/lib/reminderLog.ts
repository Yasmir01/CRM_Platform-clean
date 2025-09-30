import { prisma } from "@/lib/prisma";

export async function createReminderLog(args: {
  reminderId: string;
  initiatedBy?: string;
  channel: string;
  status: string;
  response?: any;
  note?: string;
}) {
  const { reminderId, initiatedBy = "system", channel, status, response, note } = args;
  try {
    return await prisma.reminderLog.create({
      data: {
        reminderId,
        initiatedBy,
        channel,
        status,
        response: response ? JSON.parse(JSON.stringify(response)) : null,
        note,
      },
    });
  } catch (e) {
    console.error("createReminderLog failed", e);
    return null;
  }
}
