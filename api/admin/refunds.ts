import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { ensurePermission } from '../../src/lib/authorize';
import { getPaymentProvider } from '../../src/lib/payments/factory';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method || 'GET';
  if (!['GET', 'POST'].includes(method)) {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) return res.status(403).json({ error: 'Forbidden' });

  try {
    if (method === 'GET') {
      const refunds = await prisma.refund.findMany({
        include: { tenant: true, payment: true },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(refunds);
    }

    // POST
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const paymentId = String(body.paymentId || '');
    const amountRaw = body.amount !== undefined ? Number(body.amount) : undefined;
    const reason = body.reason ? String(body.reason) : undefined;

    if (!paymentId) return res.status(400).json({ error: 'Missing paymentId' });

    const payment = await prisma.rentPayment.findUnique({ where: { id: paymentId } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    const alreadyRefunded = Number((payment as any).refundedAmount || 0);
    const amount = amountRaw !== undefined ? amountRaw : Number(payment.amount) - alreadyRefunded;
    const remaining = Number(payment.amount) - alreadyRefunded;
    if (!Number.isFinite(amount) || amount <= 0 || amount > remaining) {
      return res.status(400).json({ error: 'Invalid refund amount' });
    }

    let status = 'PENDING';

    try {
      const providerKey = String(payment.gateway || '').toLowerCase() as any;
      if (providerKey === 'stripe' || providerKey === 'applepay') {
        if (!payment.externalId) throw new Error('Missing externalId for Stripe refund');
        const stripe = getPaymentProvider('stripe');
        await stripe.refundPayment(payment.externalId, amount);
      } else if (providerKey === 'paypal') {
        if (!payment.externalId) throw new Error('Missing externalId for PayPal refund');
        const paypal = getPaymentProvider('paypal');
        await paypal.refundPayment(payment.externalId, amount);
      }
      status = 'COMPLETED';
    } catch (e: any) {
      console.error('refund provider error', e?.message || e);
      status = 'FAILED';
    }

    const refund = await prisma.refund.create({
      data: {
        paymentId: payment.id,
        tenantId: payment.tenantId,
        amount,
        reason: reason || null,
        gateway: String(payment.gateway),
        status,
      },
    });

    if (status === 'COMPLETED') {
      try {
        const newRefunded = alreadyRefunded + amount;
        const newStatus = newRefunded < Number(payment.amount) ? 'partially_refunded' : 'refunded';
        await prisma.rentPayment.update({ where: { id: payment.id }, data: { refundedAmount: newRefunded, status: newStatus, refundReason: reason || null } });
      } catch {}
    }

    try {
      const { sendNotification } = await import('../../src/lib/notifications');
      await sendNotification({
        userId: payment.tenantId,
        type: 'REFUND_PROCESSED',
        title: 'Your refund has been processed',
        message: `A refund of $${amount} has been ${status.toLowerCase()}. Reason: ${reason || 'N/A'}.`,
      });
      await sendNotification({
        userId: 'admin',
        type: 'REFUND_LOG',
        title: 'Refund action logged',
        message: `Refund of $${amount} for Payment ${payment.id} is ${status}.`,
      });
    } catch {}

    return res.status(200).json(refund);
  } catch (e: any) {
    console.error('admin/refunds error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
