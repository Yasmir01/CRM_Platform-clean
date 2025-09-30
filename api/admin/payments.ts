import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';

function daysBetween(date1: Date, date2: Date) {
  return Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
}

function getPreviousDueDateFromDay(dueDay: number, reference = new Date()) {
  const year = reference.getFullYear();
  const month = reference.getMonth();

  function build(y: number, m: number) {
    const d = new Date(y, m, dueDay, 9, 0, 0, 0);
    if (d.getMonth() !== m) {
      return new Date(y, m + 1, 0, 9, 0, 0, 0);
    }
    return d;
  }

  let candidate = build(year, month);
  if (candidate > reference) {
    const prevMonth = month - 1;
    const prevYear = prevMonth < 0 ? year - 1 : year;
    const pm = (prevMonth + 12) % 12;
    candidate = build(prevYear, pm);
  }
  return candidate;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userPayload = getUserOr401(req, res);
  if (!userPayload) return;

  const userId = String(userPayload.sub || userPayload?.id || '');
  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!dbUser) return res.status(401).json({ error: 'Unauthorized' });

  const allowed = ['SUPER_ADMIN', 'ADMIN', 'OWNER'];
  const role = String(dbUser.role || '').toUpperCase();
  if (!allowed.includes(role)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Fetch recent rent payments
    const payments = await prisma.rentPayment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { tenant: true, lease: { include: { unit: { include: { property: true } }, property: true } } },
      take: 200,
    });

    // Fetch active leases to detect overdue
    const leases = await prisma.lease.findMany({ where: { archived: false, status: 'ACTIVE' }, include: { tenant: true, unit: { include: { property: true } }, property: true } });

    const today = new Date();

    const overdueLeases = leases.filter((l: any) => {
      const dueDay = (l as any).dueDay as number | null | undefined;
      if (!dueDay) return false;
      const lastDue = getPreviousDueDateFromDay(dueDay, today);
      if (lastDue >= today) return false; // not past due yet

      // check if there's a payment for this lease after lastDue
      const paid = payments.find((p: any) => p.leaseId === l.id && new Date(p.createdAt) >= lastDue && (String(p.status || '').toLowerCase() === 'success' || String(p.status || '').toLowerCase() === 'paid' || String(p.status || '').toLowerCase() === 'succeeded'));
      return !paid;
    });

    return res.status(200).json({ payments, overdue: overdueLeases });
  } catch (err: any) {
    console.error('admin payments error', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
