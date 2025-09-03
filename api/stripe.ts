import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { prisma } from './_db';

// Align API version; cast to Stripe type to avoid literal mismatches with SDK typings
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-08-27.basil' as unknown as Stripe.StripeConfig['apiVersion'],
});

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  if ((req as any).rawBody) return Buffer.from((req as any).rawBody);
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve) => {
    (req as any).on('data', (chunk: Buffer) => chunks.push(chunk));
    (req as any).on('end', () => resolve());
  });
  return Buffer.concat(chunks);
}

async function verifyWebhook(req: VercelRequest): Promise<Stripe.Event> {
  const sig = (req.headers['stripe-signature'] || '') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
  const buf = await getRawBody(req);
  return stripe.webhooks.constructEventAsync(buf, sig, webhookSecret);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const method = req.method || 'GET';
    const action = (req.query?.action as string) || '';

    // Create Checkout Session (supports priceId or planId)
    if (method === 'POST' && action === 'createCheckout') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      const { priceId, successUrl, cancelUrl, planId, quantity = 1, customerEmail } = body as any;
      if (!successUrl || !cancelUrl) return res.status(400).json({ error: 'Missing successUrl/cancelUrl' });

      let session: Stripe.Checkout.Session;
      if (priceId) {
        session = await stripe.checkout.sessions.create({
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [{ price: priceId, quantity: 1 }],
          success_url: successUrl,
          cancel_url: cancelUrl,
          customer_email: customerEmail,
        });
      } else if (planId) {
        const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
        if (!plan || !plan.isActive) return res.status(404).json({ error: 'Plan not found or inactive' });
        const unit_amount = Math.round((plan.price || 0) * 100);
        session = await stripe.checkout.sessions.create({
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
                unit_amount,
              },
              quantity,
            },
          ],
        });
      } else {
        return res.status(400).json({ error: 'Missing priceId or planId' });
      }

      return res.status(200).json({ id: session.id, url: session.url });
    }

    // Customer Billing Portal
    if ((method === 'GET' || method === 'POST') && action === 'portal') {
      const q = method === 'GET' ? req.query : (typeof req.body === 'string' ? JSON.parse(req.body as any) : (req.body || {}));
      const { customerId, returnUrl } = q as any;
      if (!customerId) return res.status(400).json({ error: 'Missing customerId' });
      const portal = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: (returnUrl as string) || '' });
      // Use a JSON response to avoid issues in serverless proxies
      return res.status(200).json({ url: portal.url });
    }

    // Webhook
    if (method === 'POST' && action === 'webhook') {
      let event: Stripe.Event;
      try {
        event = await verifyWebhook(req);
      } catch (err: any) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      try {
        switch (event.type) {
          case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            const email = session.customer_details?.email || undefined;
            if (email) {
              let subscriber = await prisma.subscriber.findUnique({ where: { email } });
              if (!subscriber) {
                subscriber = await prisma.subscriber.create({ data: { email, companyName: null } });
              }
              if (session.customer) {
                const exists = await prisma.subscription.findFirst({ where: { stripeCustomerId: session.customer as string, subscriberId: subscriber.id } });
                if (!exists) {
                  await prisma.subscription.create({ data: { subscriberId: subscriber.id, planId: null, status: 'active', stripeCustomerId: session.customer as string, stripeSubscriptionId: null, cancelAtPeriodEnd: false } });
                }
              }
            }
            break;
          }
          case 'invoice.payment_succeeded': {
            const invoice = event.data.object as Stripe.Invoice;
            const amount = (invoice.amount_paid || 0) / 100;
            const stripeSubId = ((invoice as any).subscription as string) || null;
            let subscription: any = null;
            if (stripeSubId) {
              subscription = await prisma.subscription.findFirst({ where: { stripeSubscriptionId: stripeSubId } });
            }
            if (subscription) {
              const existing = await prisma.payment.findFirst({ where: { externalId: invoice.id, provider: 'stripe' } });
              if (!existing) {
                await prisma.payment.create({
                  data: {
                    subscriptionId: subscription.id,
                    amount,
                    currency: (invoice.currency || 'usd').toLowerCase(),
                    status: 'succeeded',
                    provider: 'stripe',
                    externalId: invoice.id,
                  },
                });
              }
              await prisma.revenueEvent.create({ data: { subscriptionId: subscription.id, type: 'invoice.payment_succeeded', amount, metadata: { invoiceId: invoice.id } } });
            } else {
              await prisma.revenueEvent.create({ data: { subscriptionId: null, type: 'invoice.payment_succeeded', amount, metadata: { invoiceId: invoice.id } } });
            }
            break;
          }
          default:
            break;
        }
      } catch (e) {
        console.warn('Webhook handling error', e);
      }

      return res.status(200).json({ received: true });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).send('Method Not Allowed');
  } catch (err: any) {
    console.error('Stripe handler error', err);
    return res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}
