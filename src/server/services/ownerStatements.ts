import { PrismaClient, PaymentStatus } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Generate owner statement for a given period
 */
export async function generateOwnerStatement(
  ownerId: string,
  propertyId: string | null,
  start: Date,
  end: Date
) {
  // Aggregate income from payments linked to leases under the property, completed in window
  const incomeAgg = await prisma.payment.aggregate({
    where: {
      lease: propertyId ? { propertyId } : undefined,
      status: PaymentStatus.SUCCEEDED,
      completedAt: { gte: start, lte: end },
    },
    _sum: { amount: true },
  });

  // Aggregate expenses from completed work orders for the property in window
  const expenseAgg = await prisma.workOrder.aggregate({
    where: {
      ...(propertyId ? { propertyId } : {}),
      status: "COMPLETED",
      updatedAt: { gte: start, lte: end },
    },
    _sum: { actualCost: true },
  } as any);

  const totalIncome = Number(incomeAgg._sum.amount || 0);
  const totalExpense = Number((expenseAgg as any)._sum?.actualCost || 0);
  const netIncome = totalIncome - totalExpense;

  const stmt = await prisma.ownerStatement.create({
    data: {
      ownerId,
      propertyId: propertyId || undefined,
      periodStart: start,
      periodEnd: end,
      totalIncome: totalIncome.toFixed(2),
      totalExpense: totalExpense.toFixed(2),
      netIncome: netIncome.toFixed(2),
    },
  });

  return stmt;
}

/**
 * Fetch statements for an owner
 */
export async function listOwnerStatements(ownerId: string) {
  return prisma.ownerStatement.findMany({
    where: { ownerId },
    orderBy: { periodEnd: "desc" },
  });
}
