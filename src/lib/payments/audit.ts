import { prisma } from '@/lib/prisma';

export type PaymentAuditAction = 'payment_created' | 'refund_issued' | 'late_fee_applied' | 'dispute_opened' | 'dispute_resolved';

export async function logPaymentAudit(params: {
  paymentId?: string | null;
  tenantId?: string | null;
  action: PaymentAuditAction;
  details?: string | null;
  actorId?: string | null;
}) {
  try {
    await prisma.paymentAudit.create({
      data: {
        paymentId: params.paymentId || undefined,
        tenantId: params.tenantId || undefined,
        action: params.action,
        details: params.details || undefined,
        actorId: params.actorId || undefined,
      },
    });
  } catch (e) {
    console.error('logPaymentAudit error', (e as any)?.message || e);
  }
}
