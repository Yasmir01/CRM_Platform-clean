import { PrismaClient, PaymentStatus } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Create a new payment for a lease or rent schedule.
 */
export async function createPayment({
  leaseId,
  scheduleId,
  methodId,
  amount,
  createdById,
}: {
  leaseId: string;
  scheduleId?: string;
  methodId?: string;
  amount: number;
  createdById?: string;
}) {
  const lease = await prisma.lease.findUniqueOrThrow({ where: { id: leaseId } });

  return prisma.payment.create({
    data: {
      leaseId,
      scheduleId,
      methodId,
      amount: amount.toFixed(2),
      status: PaymentStatus.INITIATED,
      createdById,
      organizationId: lease.organizationId,
    },
  });
}

/**
 * Mark an existing payment as succeeded (after PSP confirmation).
 */
export async function markPaymentSucceeded(paymentId: string, externalRef?: string) {
  return prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: PaymentStatus.SUCCEEDED,
      completedAt: new Date(),
      externalRef,
    },
  });
}

/**
 * Issue a refund for a completed payment.
 */
export async function issueRefund({
  paymentId,
  amount,
  reason,
  createdById,
}: {
  paymentId: string;
  amount: number;
  reason?: string;
  createdById?: string;
}) {
  const payment = await prisma.payment.findUniqueOrThrow({ where: { id: paymentId } });

  return prisma.refund.create({
    data: {
      organizationId: payment.organizationId,
      leaseId: payment.leaseId,
      paymentId,
      amount: amount.toFixed(2),
      reason,
      createdById,
    },
  });
}
