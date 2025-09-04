import { prisma } from '../_db';
import dayjs from 'dayjs';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { idempotencyKey, leaseId, propertyId, payerTenantId, amount, gatewayName, transactionId, invoiceId } = body as {
      idempotencyKey?: string; leaseId?: string; propertyId?: string; payerTenantId?: string; amount: number; gatewayName: string; transactionId: string; invoiceId?: string;
    };

    if (idempotencyKey) {
      const existing = await prisma.rentPayment.findUnique({ where: { idempotencyKey } });
      if (existing) return res.status(200).json(existing);
    }

    let policy: any = null;
    if (propertyId) {
      policy = await prisma.propertyPaymentPolicy.findUnique({ where: { propertyId: String(propertyId) } });
    } else {
      policy = await prisma.propertyPaymentPolicy.findFirst({ where: { propertyId: null } });
    }

    let lease: any = null;
    if (leaseId) {
      lease = await prisma.lease.findUnique({ where: { id: String(leaseId) } });
    }

    const minPartial = Number(policy?.minPartialUsd ?? 10);
    const allowPartial = typeof lease?.allowPartial === 'boolean' ? Boolean(lease.allowPartial) : Boolean(policy?.allowPartial ?? true);
    if (!allowPartial && Number(amount) < minPartial) {
      return res.status(400).json({ error: 'Partial payments disabled for this property/lease' });
    }

    const payment = await prisma.rentPayment.create({
      data: {
        leaseId: leaseId ? String(leaseId) : null,
        propertyId: propertyId ? String(propertyId) : null,
        tenantId: payerTenantId ? String(payerTenantId) : String(payerTenantId || ''),
        amount: Number(amount),
        status: 'success',
        externalId: String(transactionId || ''),
        gateway: String(gatewayName || ''),
        idempotencyKey: idempotencyKey ? String(idempotencyKey) : null,
      },
    });

    const targets = invoiceId
      ? await prisma.invoice.findMany({ where: { id: String(invoiceId), status: { in: ['OPEN','PARTIALLY_PAID'] } }, include: { lines: true } })
      : await prisma.invoice.findMany({ where: { leaseId: String(leaseId || '') || undefined, status: { in: ['OPEN','PARTIALLY_PAID'] } }, orderBy: { dueDate: 'asc' }, include: { lines: true } });

    let remaining = Number(amount);

    for (const inv of targets) {
      if (remaining <= 0) break;

      const billedLines = inv.lines.filter((l: any) => !!l.billToTenantId);
      if (billedLines.length) {
        const ordered = [
          ...billedLines.filter((l: any) => l.billToTenantId === payerTenantId),
          ...billedLines.filter((l: any) => l.billToTenantId !== payerTenantId),
        ];
        for (const line of ordered) {
          if (remaining <= 0) break;
          const linePaid = await prisma.paymentAllocation.aggregate({
            _sum: { amount: true },
            where: { invoiceId: inv.id, tenantId: line.billToTenantId },
          });
          const lineAmt = Number(line.amount);
          const lineDue = Math.max(0, lineAmt - Number(linePaid._sum.amount ?? 0));
          const toApply = Math.min(remaining, lineDue);
          if (toApply > 0) {
            await prisma.paymentAllocation.create({
              data: {
                paymentId: payment.id,
                invoiceId: inv.id,
                tenantId: line.billToTenantId as string,
                amount: Number(toApply.toFixed(2)),
              },
            });
            remaining -= toApply;
          }
        }
      }

      const invAllocSum = await prisma.paymentAllocation.aggregate({ _sum: { amount: true }, where: { invoiceId: inv.id } });
      const invDue = Math.max(0, Number(inv.totalAmount) - Number(invAllocSum._sum.amount ?? 0));
      if (remaining > 0 && invDue > 0) {
        const toApply = Math.min(remaining, invDue);
        await prisma.paymentAllocation.create({
          data: {
            paymentId: payment.id,
            invoiceId: inv.id,
            tenantId: payerTenantId ? String(payerTenantId) : null,
            amount: Number(toApply.toFixed(2)),
          },
        });
        remaining -= toApply;
      }

      const afterAlloc = await prisma.paymentAllocation.aggregate({ _sum: { amount: true }, where: { invoiceId: inv.id } });
      const newBalance = Number((Number(inv.totalAmount) - Number(afterAlloc._sum.amount ?? 0)).toFixed(2));
      await prisma.invoice.update({
        where: { id: inv.id },
        data: {
          balanceDue: newBalance,
          status: newBalance <= 0 ? 'PAID' : (newBalance < Number(inv.totalAmount) ? 'PARTIALLY_PAID' : 'OPEN'),
        },
      });
    }

    const totalAlloc = await prisma.paymentAllocation.aggregate({ _sum: { amount: true }, where: { paymentId: payment.id } });
    const updatedPayment = await prisma.rentPayment.update({ where: { id: payment.id }, data: { allocatedAmount: Number(totalAlloc._sum.amount ?? 0) } });

    return res.status(200).json(updatedPayment);
  } catch (e: any) {
    console.error('payments/record POST error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
