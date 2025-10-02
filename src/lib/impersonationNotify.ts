
import { prisma } from '../../api/_db';
import { prisma } from '../../pages/api/_db';
import { sendMail } from './mailer';

export async function notifyImpersonation(targetUserId: string, impersonatorEmail: string) {
  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user || !user.email) return;

  const subject = 'Your account was accessed by an Admin';
  const text = `\nHello ${user.name || ''},\n\nYour account (${user.email}) was accessed by an Admin (${impersonatorEmail}) for troubleshooting at ${new Date().toLocaleString()}.\n\nThis session may have allowed the Admin to view your account as if they were you.\nIf you have any concerns, please contact support.\n\n- ${process.env.APP_NAME || 'MyCRM'} Security Team\n`;

  await sendMail([user.email], subject, text);

  await prisma.impersonationLog.updateMany({
    where: { targetUserId, endedAt: null },
    data: { notified: true },
  });

  await prisma.userNotification.create({
    data: {
      userId: targetUserId,
      message: `Your account was accessed by ${impersonatorEmail} at ${new Date().toLocaleString()}`,
    },
  });
}

export async function notifyImpersonationEnd(targetUserId: string, impersonatorEmail: string) {
  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user || !user.email) return;
  const subject = 'Admin impersonation session ended';
  const text = `\nHello ${user.name || ''},\n\nThe impersonation session by (${impersonatorEmail}) for your account ended at ${new Date().toLocaleString()}.\nIf you did not expect this, please contact support.\n\n- ${process.env.APP_NAME || 'MyCRM'} Security Team\n`;
  await sendMail([user.email], subject, text);
  await prisma.userNotification.create({
    data: {
      userId: targetUserId,
      message: `Impersonation session by ${impersonatorEmail} has ended at ${new Date().toLocaleString()}`,
    },
  });
}
