import { prisma } from '../../pages/api/_db';
import { notify } from './notify';

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export async function sendRentReminders() {
  const today = new Date();
  const reminderOffsets = [3, 1];

  for (const offset of reminderOffsets) {
    const targetDate = addDays(today, offset);
    const targetDay = targetDate.getDate();

    const leases = await prisma.lease.findMany({
      where: {
        status: 'ACTIVE' as any,
        archived: false,
        dueDay: targetDay,
        rentAmount: { not: null },
        startDate: { lte: targetDate },
        OR: [{ endDate: null }, { endDate: { gte: targetDate } }],
      },
      include: {
        tenant: true,
      },
    });

    for (const lease of leases) {
      const amount = lease.rentAmount ?? 0;
      const currencyAmount = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const when = offset === 3 ? 'in 3 days' : 'tomorrow';
      const title = 'Rent Due Reminder';
      const message = `Reminder: Your rent of $${currencyAmount} is due ${when}.`;

      const tenantEmail = lease.tenant?.email || null;

      // Try to map tenant email to a user for in-app notification
      let userId: string | null = null;
      if (tenantEmail) {
        const u = await prisma.user.findFirst({ where: { email: tenantEmail } });
        if (u) userId = u.id;
      }

      await notify({
        userId,
        email: tenantEmail,
        type: 'rent_due',
        title,
        message,
        meta: { leaseId: lease.id, rentAmount: amount, dueDay: lease.dueDay, offsetDays: offset },
      });
    }
  }
}
