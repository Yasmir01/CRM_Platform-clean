import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { notify } from '../../src/lib/notify';

function daysBetween(a: Date, b: Date) { return Math.ceil((b.getTime() - a.getTime()) / 86400000); }

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const today = new Date();

  const leases = await prisma.lease.findMany({
    where: { endDate: { gte: today } },
    include: { tenant: true, renewalSettings: true }
  });

  for (const l of leases) {
    if (!l.endDate) continue;
    const left = daysBetween(today, new Date(l.endDate));
    const rs = (l as any).renewalSettings?.[0];
    const should60 = (!!rs?.notify60) && left === 60;
    const should30 = (!!rs?.notify30) && left === 30;
    const should15 = (!!rs?.notify15) && left === 15;

    if (should60 || should30 || should15) {
      const msg = `Lease ends on ${new Date(l.endDate).toLocaleDateString()}. ${left} days remaining.`;
      if ((l as any).tenant?.email) {
        await notify({ email: (l as any).tenant.email, type: 'lease_renewal', title: 'Lease Renewal Reminder', message: msg });
      }
    }
  }

  return res.status(200).json({ ok: true });
}
