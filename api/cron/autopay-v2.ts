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
    try {
      if (ap.method.startsWith('stripe')) {
        if (!stripe) continue;
        const tenant = await prisma.user.findUnique({ where: { id: ap.tenantId } });
        if (!tenant?.stripeCustomerId || !tenant?.defaultPmId) continue;
        const pi = await stripe.paymentIntents.create({ amount: Math.round(ap.amount * 100), currency: 'usd', customer: tenant.stripeCustomerId, payment_method: tenant.defaultPmId, off_session: true, confirm: true, metadata: { tenantId: ap.tenantId, leaseId: ap.leaseId, type: 'rent_autopay_v2' } });
        await prisma.rentPayment.create({ data: { leaseId: ap.leaseId, tenantId: ap.tenantId, amount: ap.amount, method: ap.method, status: 'succeeded', transactionId: pi.payment_intent?.toString?.() || pi.id, paidAt: new Date() } });
        processed += 1;
      }
    } catch (e: any) {
      await prisma.autopayAttempt.create({ data: { tenantId: ap.tenantId, leaseId: ap.leaseId, amount: ap.amount, status: 'failed', errorMsg: e?.message || 'autopay error' } as any });
      await notify({ userId: ap.tenantId, type: 'autopay_failed', title: 'Autopay Failed', message: e?.message || 'Could not charge your payment method.' });
    }
  }

  return res.status(200).json({ ok: true, processed });
}
