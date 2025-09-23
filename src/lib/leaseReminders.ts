import { prisma } from '../../pages/api/_db';
import { notify } from './notify';

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export async function sendLeaseExpiryReminders() {
  const today = new Date();
  const offsets = [30, 7, 0];

  for (const offset of offsets) {
    const target = addDays(today, offset);
    const from = startOfDay(target);
    const to = endOfDay(target);

    const leases = await prisma.lease.findMany({
      where: {
        archived: false,
        status: 'ACTIVE' as any,
        endDate: { gte: from, lte: to },
      },
      include: { tenant: true },
    });

    for (const lease of leases) {
      const end = lease.endDate ? new Date(lease.endDate) : null;
      const endStr = end ? end.toDateString() : '';
      const message = offset === 30
        ? `Your lease will expire in 30 days (on ${endStr}). Please prepare for renewal or move-out.`
        : offset === 7
        ? `Your lease will expire in 7 days (on ${endStr}).`
        : `Your lease expires today (${endStr}).`;

      const tenantEmail = lease.tenant?.email || null;

      // Map tenant to app user for in-app notification if possible
      let tenantUserId: string | null = null;
      if (tenantEmail) {
        const u = await prisma.user.findFirst({ where: { email: tenantEmail } });
        if (u) tenantUserId = u.id;
      }

      await notify({
        userId: tenantUserId || undefined,
        email: tenantEmail || undefined,
        type: 'lease_expiry',
        title: 'Lease Expiry Reminder',
        message,
        meta: { leaseId: lease.id, endDate: lease.endDate, offsetDays: offset },
      });

      // Notify org roles (OWNER, MANAGER, ADMIN)
      const adminWhere: any = {
        role: { in: ['OWNER', 'MANAGER', 'ADMIN'] as any },
      };
      if (lease.orgId) adminWhere.orgId = lease.orgId;

      const admins = await prisma.user.findMany({ where: adminWhere, select: { id: true, email: true, name: true } });
      const who = lease.tenant?.name ? `${lease.tenant.name}` : 'tenant';
      const adminTitle = 'Lease Expiry Alert';
      const adminMsg = offset === 0
        ? `Lease for ${who} expires today (${endStr}).`
        : `Lease for ${who} is expiring in ${offset} days (on ${endStr}).`;

      for (const admin of admins) {
        await notify({
          userId: admin.id,
          email: admin.email || undefined,
          type: 'lease_expiry',
          title: adminTitle,
          message: adminMsg,
          meta: { leaseId: lease.id, tenantId: lease.tenantId, endDate: lease.endDate, offsetDays: offset },
        });
      }
    }
  }
}
