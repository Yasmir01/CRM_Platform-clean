import { prisma } from '../../api/_db';
import { sendMail } from './mailer';

export type NotifyInput = {
  userId?: string | null;
  email?: string | null;
  type?: string;
  title?: string;
  message: string;
  meta?: Record<string, any> | null;
};

export async function notify(input: NotifyInput) {
  const { userId, email, type, title, message, meta } = input;

  let resolvedUserId = userId || null;
  let resolvedEmail = email || null;

  try {
    if (!resolvedUserId && resolvedEmail) {
      const u = await prisma.user.findFirst({ where: { email: resolvedEmail } });
      if (u) resolvedUserId = u.id;
    }

    if (!resolvedEmail && resolvedUserId) {
      const u = await prisma.user.findUnique({ where: { id: resolvedUserId } });
      if (u?.email) resolvedEmail = u.email;
    }

    if (resolvedUserId) {
      await prisma.userNotification.create({
        data: {
          userId: resolvedUserId,
          message,
          type,
          title,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          meta: (meta as any) || undefined,
        },
      });
    }

    if (resolvedEmail && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const subject = title || (type ? `${type.replace(/_/g, ' ')} notification` : 'Notification');
      await sendMail([resolvedEmail], subject, message);
    }
  } catch (e) {
    // Do not throw to avoid failing cron jobs; log instead
    console.error('notify error', (e as any)?.message || e);
  }
}
