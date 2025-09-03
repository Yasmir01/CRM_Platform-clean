import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { stripe } from '../../src/lib/stripe';
import { isAuthorizedAdmin } from '../_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const isCron = Boolean((req.headers['x-vercel-cron'] as string) || (req.headers['X-Vercel-Cron'] as any));
  if (!isCron && !isAuthorizedAdmin(req)) return res.status(403).json({ error: 'Forbidden' });

  if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });

  const today = new Date();
  const day = today.getUTCDate();

  const users = await prisma.user.findMany({
    where: { role: 'TENANT' as any },
    include: { preferences: true },
  });

  let processed = 0;
  for (const u of users) {
    if (!u.preferences?.autopayEnabled) continue;
    const lease = await prisma.lease.findFirst({ where: { tenantId: u.id, startDate: { lte: today }, OR: [{ endDate: null }, { endDate: { gte: today } }] } });
    if (!lease) continue;
    const dueDay = u.preferences.autopayDayOverride ?? lease.dueDay ?? null;
    if (!dueDay || dueDay !== day) continue;
    if (!u.stripeCustomerId || !u.defaultPmId || !lease.rentAmount) continue;

    try {
      await stripe.paymentIntents.create({
        amount: Math.round(lease.rentAmount * 100),
        currency: 'usd',
        customer: u.stripeCustomerId,
        payment_method: u.defaultPmId,
        off_session: true,
        confirm: true,
        metadata: { tenantId: u.id, orgId: u.orgId, leaseId: lease.id, type: 'rent_autopay' },
      });
      processed += 1;
    } catch (e) {
      console.error('autopay failed', u.id, (e as any)?.message || e);
    }
  }

  return res.status(200).json({ ok: true, processed });
}
