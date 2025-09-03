import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { stripe } from '../../src/lib/stripe';
import { isAuthorizedAdmin } from '../_auth';
import { notify } from '../../src/lib/notify';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const isCron = Boolean((req.headers['x-vercel-cron'] as string) || (req.headers['X-Vercel-Cron'] as any));
  if (!isCron && !isAuthorizedAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
  const now = new Date();

  const due = await prisma.autoPayRetry.findMany({ where: { attempted: false, retryAt: { lte: now } }, orderBy: { retryAt: 'asc' }, take: 50 });

  let processed = 0;
  for (const r of due) {
    const ap = await prisma.autoPay.findUnique({ where: { id: r.autoPayId } });
    if (!ap || !ap.active) { await prisma.autoPayRetry.update({ where: { id: r.id }, data: { attempted: true } }); continue; }

    try {
      if (ap.method.startsWith('stripe')) {
        if (!stripe) continue;
        const tenant = await prisma.user.findUnique({ where: { id: ap.tenantId } });
        if (!tenant?.stripeCustomerId || !tenant?.defaultPmId) continue;
        const pi = await stripe.paymentIntents.create({ amount: Math.round(ap.amount * 100), currency: 'usd', customer: tenant.stripeCustomerId, payment_method: tenant.defaultPmId, off_session: true, confirm: true, metadata: { tenantId: ap.tenantId, leaseId: ap.leaseId, type: 'rent_autopay_retry_v2' } });
        await prisma.rentPayment.update({ where: { id: r.paymentId }, data: { status: 'succeeded', transactionId: pi.id, paidAt: new Date() } });
        await prisma.autoPayRetry.update({ where: { id: r.id }, data: { attempted: true } });
        await notify({ userId: ap.tenantId, type: 'autopay_retry_succeeded', title: 'AutoPay Retry Succeeded', message: `$${ap.amount.toFixed(2)} paid` });
        processed += 1;
      }
    } catch (e: any) {
      await prisma.autoPayRetry.update({ where: { id: r.id }, data: { attempted: true } });
      await notify({ userId: ap!.tenantId, type: 'autopay_retry_failed', title: 'AutoPay Retry Failed', message: e?.message || 'Could not charge your payment method.' });
    }
  }

  return res.status(200).json({ ok: true, processed });
}
