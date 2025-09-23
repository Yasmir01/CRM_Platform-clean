import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../../pages/api/_db';

function addInterval(date: Date, freq: string, interval: number) {
  const d = new Date(date);
  switch (freq) {
    case 'DAY': d.setDate(d.getDate() + interval); break;
    case 'WEEK': d.setDate(d.getDate() + 7 * interval); break;
    case 'MONTH': d.setMonth(d.getMonth() + interval); break;
    case 'QUARTER': d.setMonth(d.getMonth() + 3 * interval); break;
    case 'YEAR': d.setFullYear(d.getFullYear() + interval); break;
  }
  return d;
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const now = new Date();

  const dueTasks = await prisma.recurringTask.findMany({
    where: { isActive: true, nextRunAt: { lte: now } },
  });

  let created = 0;
  for (const task of dueTasks) {
    await prisma.maintenanceRequest.create({
      data: {
        propertyId: task.propertyId,
        unitId: task.unitId,
        title: `[Recurring] ${task.title}`,
        description: task.description || '',
        priority: 'normal',
        vendorId: task.vendorId || undefined,
      },
    });

    await prisma.recurringTask.update({
      where: { id: task.id },
      data: {
        lastRunAt: now,
        nextRunAt: addInterval(task.nextRunAt, task.frequency, task.interval),
      },
    });
    created += 1;
  }

  return res.status(200).json({ ok: true, created });
}
