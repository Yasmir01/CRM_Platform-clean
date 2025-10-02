import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";
import { sendSMS } from "@/lib/sms";
import { createNotification } from "@/lib/notify";
import { pusher } from "@/lib/pusher";
import { isRemindersAllowedForSubscriber } from "@/lib/featureChecks";
import { createReminderLog } from "@/lib/reminderLog";

let twilioClient: any = null;
try {
  if (process.env.TWILIO_SID) {
    // require dynamically to avoid hard dependency
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Twilio = require('twilio');
    twilioClient = new Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  }
} catch (e) {
  // twilio not installed or failed to init; fall back to sendSMS helper
  twilioClient = null;
}

export async function sendReminderNow(reminderId: string, initiatedBy: string = 'system') {
  const reminder = await prisma.reminder.findUnique({ where: { id: reminderId }, include: { subscriber: true, tenant: true, property: true } });
  if (!reminder) return;

  if (!reminder.subscriberId || !reminder.subscriber) {
    await createReminderLog({ reminderId, initiatedBy, channel: 'system', status: 'failed', note: 'No subscriber associated' });
    await prisma.reminder.update({ where: { id: reminder.id }, data: { status: 'FAILED', attempts: { increment: 1 } } });
    return;
  }

  const allowed = await isRemindersAllowedForSubscriber(reminder.subscriberId);
  if (!allowed) {
    await createReminderLog({ reminderId: reminder.id, initiatedBy, channel: 'system', status: 'skipped', note: 'Reminders disabled by plan/admin/subscriber' });
    await prisma.reminder.update({ where: { id: reminder.id }, data: { status: 'CANCELLED' } });
    return;
  }

  const subject = reminder.type === 'overdue' ? 'Overdue rent notice' : 'Rent reminder';
  const text = reminder.message;

  // Email
  try {
    const toEmail = reminder.tenant?.email || reminder.subscriber?.email;
    if (reminder.subscriber?.notifyEmail && toEmail) {
      await createReminderLog({ reminderId: reminder.id, initiatedBy, channel: 'email', status: 'queued', note: `Sending email to ${toEmail}` });
      try {
        const result = await sendEmail({ to: toEmail, subject, text, html: `<p>${text}</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL}/tenant/dashboard">Open Portal</a></p>` });
        await createReminderLog({ reminderId: reminder.id, initiatedBy, channel: 'email', status: 'sent', response: { providerResult: result?.messageId || result } });
      } catch (err: any) {
        await createReminderLog({ reminderId: reminder.id, initiatedBy, channel: 'email', status: 'failed', response: { error: err?.message || String(err) } });
      }
    } else {
      await createReminderLog({ reminderId: reminder.id, initiatedBy, channel: 'email', status: 'skipped', note: 'Email not enabled or no recipient' });
    }
  } catch (e) {
    console.warn('email failed', e);
  }

  // SMS
  try {
    if (reminder.subscriber?.notifySMS && reminder.subscriber?.phone) {
      await createReminderLog({ reminderId: reminder.id, initiatedBy, channel: 'sms', status: 'queued', note: `Sending SMS to ${reminder.subscriber.phone}` });
      try {
        if (twilioClient) {
          const sms = await twilioClient.messages.create({ to: reminder.subscriber.phone, from: process.env.TWILIO_PHONE_NUMBER, body: `${subject}: ${text}`, statusCallback: `${process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio-sms` });
          await createReminderLog({ reminderId: reminder.id, initiatedBy, channel: 'sms', status: 'sent', response: { sid: sms.sid } });
        } else {
          const smsRes = await sendSMS(reminder.subscriber.phone, `${subject}: ${text}`);
          await createReminderLog({ reminderId: reminder.id, initiatedBy, channel: 'sms', status: 'sent', response: { result: smsRes } });
        }
      } catch (err: any) {
        await createReminderLog({ reminderId: reminder.id, initiatedBy, channel: 'sms', status: 'failed', response: { error: err?.message || String(err) } });
      }
    } else {
      await createReminderLog({ reminderId: reminder.id, initiatedBy, channel: 'sms', status: 'skipped', note: 'SMS not enabled or no recipient' });
    }
  } catch (e) {
    console.warn('sms failed', e);
  }

  // In-app notification
  try {
    if (reminder.tenantId) {
      await createReminderLog({ reminderId: reminder.id, initiatedBy, channel: 'in-app', status: 'queued', note: `Creating in-app notification for tenant ${reminder.tenantId}` });
      await createNotification(reminder.tenantId, 'reminder', text);
      try { await pusher.trigger(`tenant-${reminder.tenantId}`, 'new-notification', { id: reminder.id, message: text, createdAt: new Date() }); } catch (e) {}
      await createReminderLog({ reminderId: reminder.id, initiatedBy, channel: 'in-app', status: 'sent', note: `Pushed to tenant ${reminder.tenantId}` });
    } else {
      await createReminderLog({ reminderId: reminder.id, initiatedBy, channel: 'in-app', status: 'skipped', note: 'No tenantId' });
    }
  } catch (e) {
    console.warn('notify failed', e);
    await createReminderLog({ reminderId: reminder.id, initiatedBy, channel: 'in-app', status: 'failed', response: { error: String(e) } });
  }

  await prisma.reminder.update({ where: { id: reminder.id }, data: { sentAt: new Date(), status: 'SENT', attempts: { increment: 1 } } });

  // emit webhooks for reminder events
  try {
    const { emitWebhook } = await import('@/lib/webhooks');
    emitWebhook('reminder.processed', { reminderId: reminder.id, status: 'sent' }, reminder.subscriberId || undefined);
  } catch (e) {
    console.warn('emitWebhook failed for reminder', e);
  }

  await createReminderLog({ reminderId: reminder.id, initiatedBy, channel: 'system', status: 'completed', note: 'Reminder processing completed' });
}
