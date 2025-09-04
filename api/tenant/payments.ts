import { prisma } from '../_db';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { leaseId, tenantId, amount, autopay } = body as { leaseId: string; tenantId: string; amount: number; splitEmails?: string[]; autopay?: { enabled: boolean; frequency: string; amount: number; splitEmails?: string[] } | null };
    if (!leaseId || !tenantId || !amount || Number(amount) <= 0) return res.status(400).json({ error: 'Invalid request' });

    const lease = await prisma.lease.findUnique({ where: { id: String(leaseId) }, include: { unit: true } } as any);
    if (!lease) return res.status(404).json({ error: 'Lease not found' });
    const propertyId = lease.unit?.propertyId || null;

    const global = await prisma.propertyPaymentPolicy.findFirst({ where: { propertyId: null } });
    const property = propertyId ? await prisma.propertyPaymentPolicy.findUnique({ where: { propertyId } }) : null;

    const allowPartial = typeof (lease as any).allowPartial === 'boolean' ? Boolean((lease as any).allowPartial) : (property?.allowPartial ?? global?.allowPartial ?? true);
    const minPartialUsd = typeof (lease as any).minPartialUsd === 'number' ? Number((lease as any).minPartialUsd) : (property?.minPartialUsd ?? global?.minPartialUsd ?? 10);

    // Compute tenant's outstanding for this lease
    const invs = await prisma.invoice.findMany({ where: { leaseId: String(leaseId), status: { in: ['OPEN','PARTIALLY_PAID'] } }, include: { lines: true } });
    let tenantDue = 0;
    for (const inv of invs) {
      const billed = inv.lines.filter((l: any) => l.billToTenantId === tenantId).reduce((s: number, l: any) => s + Number(l.amount || 0), 0);
      if (billed > 0) {
        const alloc = await prisma.paymentAllocation.aggregate({ _sum: { amount: true }, where: { invoiceId: inv.id, tenantId: String(tenantId) } });
        tenantDue += Math.max(0, billed - Number(alloc._sum.amount ?? 0));
      }
    }

    if (!allowPartial && Number(amount) < Number(tenantDue.toFixed(2))) {
      return res.status(400).json({ message: 'Partial payments are not allowed for this lease.' });
    }
    if (allowPartial && Number(amount) < minPartialUsd) {
      return res.status(400).json({ message: `Minimum partial payment is $${minPartialUsd}.` });
    }

    // Create payment
    const payment = await prisma.rentPayment.create({
      data: {
        leaseId: String(leaseId),
        propertyId: propertyId,
        tenantId: String(tenantId),
        amount: Number(amount),
        status: 'success',
        gateway: 'tenant',
        externalId: null,
      },
    });

    // Allocate: payer's billed lines first, then remaining invoice balance
    let remaining = Number(amount);
    for (const inv of invs.sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())) {
      if (remaining <= 0) break;
      const billedLines = inv.lines.filter((l: any) => l.billToTenantId === tenantId);
      for (const line of billedLines) {
        if (remaining <= 0) break;
        const linePaid = await prisma.paymentAllocation.aggregate({ _sum: { amount: true }, where: { invoiceId: inv.id, tenantId: String(tenantId) } });
        const lineAmt = Number(line.amount);
        const lineDue = Math.max(0, lineAmt - Number(linePaid._sum.amount ?? 0));
        const toApply = Math.min(remaining, lineDue);
        if (toApply > 0) {
          await prisma.paymentAllocation.create({ data: { paymentId: payment.id, invoiceId: inv.id, tenantId: String(tenantId), amount: Number(toApply.toFixed(2)) } });
          remaining -= toApply;
        }
      }

      // Then general balance
      const invAllocSum = await prisma.paymentAllocation.aggregate({ _sum: { amount: true }, where: { invoiceId: inv.id } });
      const invDue = Math.max(0, Number(inv.totalAmount) - Number(invAllocSum._sum.amount ?? 0));
      if (remaining > 0 && invDue > 0) {
        const toApply = Math.min(remaining, invDue);
        await prisma.paymentAllocation.create({ data: { paymentId: payment.id, invoiceId: inv.id, tenantId: String(tenantId), amount: Number(toApply.toFixed(2)) } });
        remaining -= toApply;
      }

      const afterAlloc = await prisma.paymentAllocation.aggregate({ _sum: { amount: true }, where: { invoiceId: inv.id } });
      const newBalance = Number((Number(inv.totalAmount) - Number(afterAlloc._sum.amount ?? 0)).toFixed(2));
      await prisma.invoice.update({ where: { id: inv.id }, data: { balanceDue: newBalance, status: newBalance <= 0 ? 'PAID' : (newBalance < Number(inv.totalAmount) ? 'PARTIALLY_PAID' : 'OPEN') } });
    }

    const totalAlloc = await prisma.paymentAllocation.aggregate({ _sum: { amount: true }, where: { paymentId: payment.id } });
    const updatedPayment = await prisma.rentPayment.update({ where: { id: payment.id }, data: { allocatedAmount: Number(totalAlloc._sum.amount ?? 0) } });

    // Handle Autopay setup if requested
    if (autopay && autopay.enabled) {
      const frequency = String(autopay.frequency || 'monthly');
      const dayOfMonth = Number((lease as any)?.dueDay || 1);
      const apAmount = Number(autopay.amount || amount);
      try {
        await prisma.autoPay.upsert({
          where: { tenantId: String(tenantId) },
          update: { amount: apAmount, dayOfMonth, frequency, active: true, propertyId: propertyId || undefined },
          create: { tenantId: String(tenantId), amount: apAmount, dayOfMonth, frequency, active: true, propertyId: propertyId || undefined },
        });
        await prisma.user.update({ where: { id: String(tenantId) }, data: { autopayEnabled: true } });
      } catch (e) {
        console.error('autopay upsert in tenant/payments error', (e as any)?.message || e);
      }
    }

    return res.status(200).json(updatedPayment);
  } catch (e: any) {
    console.error('tenant/payments POST error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
