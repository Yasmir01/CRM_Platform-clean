import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";
import { sendSMS } from "@/lib/sms";
import { createNotification } from "@/lib/notify";
import { pusher } from "@/lib/pusher";
import { isRemindersAllowedForSubscriber } from "@/lib/featureChecks";

export async function sendReminderNow(reminderId: string) {
  const reminder = await prisma.reminder.findUnique({ where: { id: reminderId }, include: { subscriber: true, tenant: true, property: true } });
  if (!reminder) throw new Error('Reminder not found');

  if (!reminder.subscriberId || !reminder.subscriber) {
    await prisma.reminder.update({ where: { id: reminder.id }, data: { status: 'failed', attempts: { increment: 1 } } });
    return;
  }

  const allowed = await isRemindersAllowedForSubscriber(reminder.subscriberId);
  if (!allowed) {
    await prisma.reminder.update({ where: { id: reminder.id }, data: { status: 'cancelled' } });
    return;
  }

  const subject = reminder.type === 'overdue' ? 'Overdue rent notice' : 'Rent reminder';
  const text = reminder.message;

  // Email
  try {
    const toEmail = reminder.tenant?.email || reminder.subscriber?.email;
    if (reminder.subscriber?.notifyEmail && toEmail) {
      await sendEmail({ to: toEmail, subject, text, html: `<p>${text}</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL}/tenant/dashboard">Open Portal</a></p>` });
    }
  } catch (e) {
    console.warn('email failed', e);
  }

  // SMS
  try {
    if (reminder.subscriber?.notifySMS && reminder.subscriber?.phone) {
      await sendSMS(reminder.subscriber.phone, `${subject}: ${text}`);
    }
  } catch (e) {
    console.warn('sms failed', e);
  }

  // In-app notification
  try {
    if (reminder.tenantId) {
      await createNotification(reminder.tenantId, 'reminder', text);
      try { await pusher.trigger(`tenant-${reminder.tenantId}`, 'new-notification', { id: reminder.id, message: text, createdAt: new Date() }); } catch (e) {}
    }
  } catch (e) {
    console.warn('notify failed', e);
  }

  await prisma.reminder.update({ where: { id: reminder.id }, data: { sentAt: new Date(), status: 'sent', attempts: { increment: 1 } } });
}
