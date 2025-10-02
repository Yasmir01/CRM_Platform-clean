import dayjs from 'dayjs';
import { prisma } from '../../api/_db';
import { prisma } from '../../pages/api/_db';

export async function runLateFeeEngine() {
  const today = dayjs();
  let created = 0;

  const rules = await prisma.lateFeeRule.findMany({ where: { isActive: true } });

  for (const rule of rules) {
    const threshold = today.subtract(rule.gracePeriod, 'day').toDate();

    const overdue = await prisma.rentPayment.findMany({
      where: {
        status: 'pending',
        createdAt: { lt: threshold },
        ...(rule.scope === 'PROPERTY' && rule.propertyId ? { propertyId: rule.propertyId } : {}),
      },
      select: { id: true, tenantId: true, amount: true, propertyId: true },
    });

    for (const p of overdue) {
      if (!p.propertyId && rule.scope === 'PROPERTY') continue;
      const exists = await prisma.lateFee.findFirst({ where: { paymentId: p.id } });
      if (exists) continue;

      const feeAmount = rule.feeType === 'FIXED' ? rule.feeAmount : (Number(p.amount) * rule.feeAmount) / 100;

      await prisma.lateFee.create({
        data: {
          tenantId: p.tenantId,
          paymentId: p.id,
          propertyId: p.propertyId || (rule.propertyId as string),
          amount: Number(feeAmount),
          status: 'PENDING',
        },
      });
      created++;
    }
  }

  return { created };
}
