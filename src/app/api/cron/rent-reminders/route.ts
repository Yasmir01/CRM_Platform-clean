import { NextResponse } from 'next/server';
import { prisma } from '../../../../api/_db';
import { sendEmail } from '../../../lib/mailer';

export async function GET() {
  const today = new Date();

  const leases = await prisma.lease.findMany({ where: { active: true }, include: { tenant: true, property: true } });

  for (const lease of leases) {
    if (!lease.tenant?.email) continue;
    const dueDate = new Date(lease.dueDate);
    const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const sendWhen = [7, 3, 1, 0, -1, -3];
    if (!sendWhen.includes(daysUntil)) continue;

    const type = daysUntil >= 0 ? 'rent_due' : 'overdue';
    const message = daysUntil >= 0
      ? `Your rent of $${lease.rentAmount.toFixed(2)} for ${lease.property?.title || ''} is due on ${dueDate.toDateString()}.`
      : `Your rent of $${lease.rentAmount.toFixed(2)} for ${lease.property?.title || ''} was due on ${dueDate.toDateString()} and is overdue.`;

    // create Reminder record
    try {
      await prisma.reminder.create({ data: { leaseId: lease.id, tenantId: lease.tenantId, type, message, sendAt: new Date(), sentAt: new Date() } });
    } catch (e) {
      console.warn('Failed to create reminder', e);
    }

    // send email branded
    const account = lease.property?.accountId ? await prisma.account.findUnique({ where: { id: lease.property.accountId } }) : null;
    const html = `
      ${account?.logoUrl ? `<img src="${account.logoUrl}" style="height:50px" />` : ''}
      <p>Hi ${lease.tenant?.name},</p>
      <p>${message}</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/tenant/dashboard">View your tenant portal</a></p>
    `;

    try {
      await sendEmail({ to: lease.tenant.email, subject: `${type === 'overdue' ? 'Overdue rent notice' : 'Upcoming rent due'}`, text: message, html });
    } catch (e) {
      console.warn('Failed to send reminder email', e);
    }
  }

  return NextResponse.json({ ok: true });
}
