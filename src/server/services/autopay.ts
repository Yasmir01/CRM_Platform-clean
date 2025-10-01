import { PrismaClient, AutopayFrequency } from "@prisma/client";
import { createPayment } from "./payments";

const prisma = new PrismaClient();

export async function createAutopayRule({
  tenantId,
  leaseId,
  methodId,
  amount,
  frequency,
  nextRun,
}: {
  tenantId: string;
  leaseId: string;
  methodId?: string;
  amount: number;
  frequency: AutopayFrequency;
  nextRun: Date;
}) {
  return prisma.autopayRule.create({
    data: {
      tenantId,
      leaseId,
      methodId,
      amount: amount.toFixed(2),
      frequency,
      nextRun,
    },
  });
}

export async function cancelAutopayRule(ruleId: string) {
  return prisma.autopayRule.update({
    where: { id: ruleId },
    data: { isActive: false },
  });
}

/** Run autopay if due — called daily by job */
export async function processAutopayRules() {
  const today = new Date();
  const due = await prisma.autopayRule.findMany({
    where: { isActive: true, nextRun: { lte: today } },
  });

  for (const rule of due) {
    await createPayment({
      leaseId: rule.leaseId,
      methodId: rule.methodId || undefined,
      amount: Number(rule.amount),
      createdById: rule.tenantId,
    });

    let nextRun = new Date(rule.nextRun);
    if (rule.frequency === "WEEKLY") nextRun.setDate(nextRun.getDate() + 7);
    if (rule.frequency === "BIWEEKLY") nextRun.setDate(nextRun.getDate() + 14);
    if (rule.frequency === "MONTHLY") nextRun.setMonth(nextRun.getMonth() + 1);

    await prisma.autopayRule.update({
      where: { id: rule.id },
      data: { nextRun },
    });
  }

  return due.length;
}
