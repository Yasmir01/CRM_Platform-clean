import { defineHandler } from '../_handler';
import { prisma } from '../_db';
import { z } from 'zod';

const Body = z.object({
  orgId: z.string(),
  months: z.number().min(1).max(12).default(3),
});

function addMonths(d: Date, m: number) {
  const dt = new Date(d);
  dt.setMonth(dt.getMonth() + m);
  return dt;
}

function ym(dt: Date) {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export default defineHandler({
  methods: ['POST'],
  roles: ['ADMIN', 'SUPER_ADMIN', 'OWNER'],
  bodySchema: Body,
  limitKey: 'ai:forecast',
  fn: async ({ res, body }) => {
    const leases = await prisma.lease.findMany({
      where: { orgId: body.orgId, status: 'ACTIVE' as any },
      select: { rentAmount: true },
    });

    const totalRent = leases.reduce((sum, l) => sum + Number(l.rentAmount || 0), 0);
    const avgMonthlyIncome = Number(totalRent.toFixed(2));

    // No explicit expenses model available in schema; default to 0 for now
    const avgMonthlyExpenses = 0;

    const months = body.months;
    const forecast: Array<{ month: string; income: number; expenses: number; net: number }> = [];
    for (let i = 0; i < months; i++) {
      const monthLabel = ym(addMonths(new Date(), i + 1));
      const income = avgMonthlyIncome;
      const expenses = avgMonthlyExpenses;
      forecast.push({ month: monthLabel, income, expenses, net: Number((income - expenses).toFixed(2)) });
    }

    return res.status(200).json({ orgId: body.orgId, months, avgMonthlyIncome, avgMonthlyExpenses, forecast });
  },
});
