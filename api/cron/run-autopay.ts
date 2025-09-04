import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { prisma } from '../_db';
import { isAuthorizedAdmin } from '../_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const isCron = Boolean((req.headers['x-vercel-cron'] as string) || (req.headers['X-Vercel-Cron'] as any));
  if (!isCron && !isAuthorizedAdmin(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const secret = process.env.STRIPE_SECRET_KEY as string | undefined;
  if (!secret) return res.status(400).json({ error: 'Stripe not configured' });
  const stripe = new Stripe(secret, { apiVersion: '2024-06-20' });

  try {
    const today = new Date();
    const day = today.getDate();

    const autopays = await prisma.autoPay.findMany({
      where: { dayOfMonth: day, active: true },
      include: { tenant: true },
    });

    let success = 0, failed = 0;

    for (const ap of autopays) {
      const customer = ap.tenant.stripeCustomerId;
      const pm = ap.tenant.defaultPaymentMethodId;
      if (!customer || !pm) {
        await prisma.rentPayment.create({ data: { tenantId: ap.tenantId, amount: ap.amount, status: 'failed' } });
        failed++;
        continue;
      }
      try {
        await stripe.paymentIntents.create({
          amount: Math.round(ap.amount * 100),
          currency: 'usd',
          metadata: { tenantId: ap.tenantId, autopay: 'true' },
          customer,
          payment_method: pm,
          off_session: true,
          confirm: true,
        });
        await prisma.rentPayment.create({ data: { tenantId: ap.tenantId, amount: ap.amount, status: 'success' } });
        success++;
      } catch (err) {
        await prisma.rentPayment.create({ data: { tenantId: ap.tenantId, amount: ap.amount, status: 'failed' } });
        failed++;
      }
    }

    return res.status(200).json({ ok: true, success, failed });
  } catch (e: any) {
    console.error('run-autopay error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
