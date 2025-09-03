import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { prisma } from './_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const secret = process.env.STRIPE_SECRET_KEY;
    const successUrl = process.env.STRIPE_SUCCESS_URL;
    const cancelUrl = process.env.STRIPE_CANCEL_URL;
    if (!secret || !successUrl || !cancelUrl) return res.status(400).json({ error: 'Stripe not configured' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { planId, quantity = 1, customerEmail } = body || {};
    if (!planId) return res.status(400).json({ error: 'Missing planId' });

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) return res.status(404).json({ error: 'Plan not found or inactive' });

    const stripe = new Stripe(secret);
    const priceAmount = Math.round((plan.price || 0) * 100);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      success_url: successUrl + '?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `${plan.name} (${plan.billingCycle})` },
            recurring: { interval: plan.billingCycle === 'yearly' ? 'year' : 'month' },
            unit_amount: priceAmount,
          },
          quantity,
        },
      ],
    });

    return res.status(200).json({ id: session.id, url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err?.message });
  }
}
