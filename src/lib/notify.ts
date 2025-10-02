<<<<<<< HEAD
import { prisma } from '../api/_db';
=======
import { prisma } from '../pages/api/_db';
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
import { sendEmail } from './mailer';

export async function createNotification(tenantId: string, type: string, message: string) {
  // Create in-app notification
  try {
    const notification = await prisma.notification.create({ data: { tenantId, type, message } });

    // fetch tenant email
    try {
      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
      if (tenant?.email) {
        await sendEmail({ to: tenant.email, subject: 'New Notification', text: message });
      }
    } catch (e) {
      console.warn('Failed to send notification email', e);
    }

    return notification;
  } catch (err) {
    console.warn('Failed to create notification', err);
    throw err;
  }
}
