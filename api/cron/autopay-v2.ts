import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { stripe } from '../../src/lib/stripe';
import { isAuthorizedAdmin } from '../_auth';
import { notify } from '../../src/lib/notify';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const isCron = Boolean((req.headers['x-vercel-cron'] as string) || (req.headers['X-Vercel-Cron'] as any));
  if (!isCron && !isAuthorizedAdmin(req)) return res.status(403).json({ error: 'Forbidden' });

  const today = new Date();
  const day = today.getUTCDate();
  const entries = await prisma.autoPay.findMany({ where: { active: true, dayOfMonth: day } });

  let processed = 0;
  for (const ap of entries) {
    // Pre-charge notification
    await notify({ userId: ap.tenantId, type: 'autopay_scheduled', title: 'AutoPay Scheduled', message: `AutoPay scheduled today for $${ap.amount.toFixed(2)}.` });

    try {
      if (ap.method.startsWith('stripe')) {
        if (!stripe) continue;
        const tenant = await prisma.user.findUnique({ where: { id: ap.tenantId } });
        if (!tenant?.stripeCustomerId || !tenant?.defaultPmId) continue;
        const pi = await stripe.paymentIntents.create({ amount: Math.round(ap.amount * 100), currency: 'usd', customer: tenant.stripeCustomerId, payment_method: tenant.defaultPmId, off_session: true, confirm: true, metadata: { tenantId: ap.tenantId, leaseId: ap.leaseId, type: 'rent_autopay_v2' } });
        await prisma.rentPayment.create({ data: { leaseId: ap.leaseId, tenantId: ap.tenantId, amount: ap.amount, method: ap.method, status: 'succeeded', transactionId: pi.payment_intent?.toString?.() || pi.id, paidAt: new Date() } });
        await notify({ userId: ap.tenantId, type: 'autopay_succeeded', title: 'AutoPay Processed', message: `$${ap.amount.toFixed(2)} processed successfully.` });
        processed += 1;
      }
    } catch (e: any) {
      // log failed payment
      const failed = await prisma.rentPayment.create({ data: { leaseId: ap.leaseId, tenantId: ap.tenantId, amount: ap.amount, method: ap.method, status: 'failed' } });
      await notify({ userId: ap.tenantId, type: 'autopay_failed', title: 'AutoPay Failed', message: e?.message || 'Could not charge your payment method. We will retry.' });

      // retry once tomorrow
      const retryDate = new Date();
      retryDate.setUTCDate(retryDate.getUTCDate() + 1);
      await prisma.autoPayRetry.create({ data: { autoPayId: ap.id, paymentId: failed.id, retryAt: retryDate } });

      // optional late fee after 3-day grace
      const leaseDoc = await prisma.leaseDocument.findUnique({ where: { id: ap.leaseId } });
      if (leaseDoc) {
        const grace = 3;
        const dueDate = new Date(leaseDoc.updatedAt);
        const daysLate = Math.floor((today.getTime() - dueDate.getTime()) / 86400000);
        if (daysLate > grace) {
          await prisma.rentPayment.create({ data: { leaseId: ap.leaseId, tenantId: ap.tenantId, amount: 50, method: 'system', status: 'succeeded' } });
          await notify({ userId: ap.tenantId, type: 'late_fee_applied', title: 'Late Fee Applied', message: 'A $50 late fee has been applied due to failed AutoPay beyond grace period.' });
        }
      }
    }
  }

  return res.status(200).json({ ok: true, processed });
}
