import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { sendEmail } from '../../src/lib/mailer';

function daysBetween(date1: Date, date2: Date) {
  return Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
}

function getNextDueDateFromDay(dueDay: number, reference = new Date()) {
  // dueDay is 1..31. Build a date in current month with that day, if invalid (e.g., Feb 30) clamp to last day.
  const year = reference.getFullYear();
  const month = reference.getMonth();

  function build(year: number, month: number) {
    const tentative = new Date(year, month, dueDay, 9, 0, 0, 0); // 9am local
    // If the month rolled over (e.g., Feb 30 -> Mar 2) or day doesn't match, clamp to last day of month
    if (tentative.getMonth() !== month) {
      // get last day of month
      return new Date(year, month + 1, 0, 9, 0, 0, 0);
    }
    return tentative;
  }

  let candidate = build(year, month);
  if (candidate < reference) {
    // use next month
    const nextMonth = month + 1;
    const nextYear = year + (nextMonth > 11 ? 1 : 0);
    const nm = nextMonth % 12;
    candidate = build(nextYear, nm);
  }
  return candidate;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const today = new Date();

    // Find leases that are active: using archived=false and status=ACTIVE
    const leases = await prisma.lease.findMany({
      where: { archived: false, status: 'ACTIVE' },
      include: { tenant: true, unit: { include: { property: true } } },
    });

    for (const lease of leases) {
      const tenant = (lease as any).tenant;
      if (!tenant || !tenant.email) continue;

      const dueDay = (lease as any).dueDay as number | null | undefined;
      const rentAmount = (lease as any).rentAmount;
      const property = (lease as any).unit?.property || {};
      const propertyTitle = property.title || property.name || property.address || 'your property';

      if (!dueDay) continue; // nothing to check

      const dueDate = getNextDueDateFromDay(dueDay, today);
      const daysUntilDue = daysBetween(today, dueDate);

      // Reminder window: 7 days before, 3 days before, 1 day before, on due date, 1 day overdue, 3 days overdue
      if ([7, 3, 1, 0, -1, -3].includes(daysUntilDue)) {
        const subject = daysUntilDue >= 0 ? `Upcoming Rent Payment Reminder (${propertyTitle})` : `Overdue Rent Notice (${propertyTitle})`;

        const message = daysUntilDue >= 0
          ? `Hello ${tenant.name || ''},\n\nThis is a reminder that your rent of $${(rentAmount || 0).toFixed(2)} for ${propertyTitle} is due on ${dueDate.toDateString()}.\n\nThank you.`
          : `Hello ${tenant.name || ''},\n\nYour rent of $${(rentAmount || 0).toFixed(2)} for ${propertyTitle} was due on ${dueDate.toDateString()} and is now overdue.\n\nPlease make payment immediately.`;

        try {
          await sendEmail({ to: tenant.email, subject, text: message });
          console.log('Reminder sent to', tenant.email, 'lease', lease.id);
        } catch (e: any) {
          console.error('Failed sending reminder to', tenant.email, e?.message || e);
        }
      }
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('rent-reminders error', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
