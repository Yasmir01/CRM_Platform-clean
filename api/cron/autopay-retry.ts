import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { stripe } from '../../src/lib/stripe';
import { isAuthorizedAdmin } from '../_auth';
import { notify } from '../../src/lib/notify';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const isCron = Boolean((req.headers['x-vercel-cron'] as string) || (req.headers['X-Vercel-Cron'] as any));
  if (!isCron && !isAuthorizedAdmin(req)) return res.status(403).json({ error: 'Forbidden' });
  if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });

  const now = new Date();
  const attempts = await prisma.autopayAttempt.findMany({ where: { status: { in: ['failed', 'retried'] } , tryCount: { lt: 3 } }, orderBy: { runAt: 'asc' }, take: 50 });

  let processed = 0;
  for (const a of attempts) {
    const tenant = await prisma.user.findUnique({ where: { id: a.tenantId } });
    if (!tenant?.stripeCustomerId || !tenant?.defaultPmId) continue;

    const requiredDelayDays = a.tryCount === 1 ? 1 : a.tryCount === 2 ? 2 : 4;
    const earliest = new Date(a.runAt); earliest.setDate(earliest.getDate() + requiredDelayDays);
    if (now < earliest) continue;

    try {
      await stripe.paymentIntents.create({ amount: Math.round(a.amount * 100), currency: 'usd', customer: tenant.stripeCustomerId, payment_method: tenant.defaultPmId, off_session: true, confirm: true, metadata: { tenantId: a.tenantId, orgId: a.orgId || '', leaseId: a.leaseId, type: 'rent_autopay_retry' } });
      await prisma.autopayAttempt.update({ where: { id: a.id }, data: { status: 'succeeded' } });
      await notify({ userId: a.tenantId, type: 'autopay_succeeded', title: 'Autopay Retry Succeeded', message: `$${a.amount.toFixed(2)} paid` });
      processed += 1;
    } catch (e: any) {
      const nextStatus = a.tryCount + 1 >= 3 ? 'gave_up' : 'retried';
      await prisma.autopayAttempt.update({ where: { id: a.id }, data: { tryCount: a.tryCount + 1, status: nextStatus, runAt: now, errorMsg: e?.message || 'retry failed' } });
      if (nextStatus === 'gave_up') {
        await notify({ userId: a.tenantId, type: 'autopay_gave_up', title: 'Action Needed', message: 'Autopay failed 3 times. Please update payment method.' });
      }
    }
  }

  return res.status(200).json({ ok: true, processed });
}
