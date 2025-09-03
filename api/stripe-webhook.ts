import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { prisma } from './_db';

export const config = { api: { bodyParser: false } } as any;

export default async function handler(req: VercelRequest & { rawBody?: Buffer }, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) return res.status(400).json({ error: 'Stripe not configured' });

  const chunks: Buffer[] = [];
  await new Promise<void>((resolve) => {
    (req as any).on('data', (chunk: Buffer) => chunks.push(chunk));
    (req as any).on('end', () => resolve());
  });
  const buf = Buffer.concat(chunks);

  const stripe = new Stripe(secret);
  let event: Stripe.Event;
  try {
    const sig = (req.headers['stripe-signature'] || '') as string;
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerEmail = session.customer_details?.email || undefined;
        try {
          if (customerEmail) {
            let subscriber = await prisma.subscriber.findUnique({ where: { email: customerEmail } });
            if (!subscriber) {
              subscriber = await prisma.subscriber.create({ data: { email: customerEmail, companyName: null } });
            }
            // Create a placeholder subscription if none exists for this customer
            if (session.customer) {
              const existing = await prisma.subscription.findFirst({ where: { stripeCustomerId: session.customer as string, subscriberId: subscriber.id } });
              if (!existing) {
                await prisma.subscription.create({ data: { subscriberId: subscriber.id, planId: null, status: 'active', stripeCustomerId: session.customer as string, stripeSubscriptionId: null, cancelAtPeriodEnd: false } });
              }
            }
          }
        } catch (err) {
          console.warn('Failed to upsert subscriber/subscription from checkout.session.completed', err);
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const amount = (invoice.amount_paid || 0) / 100;
        try {
          const stripeSubId = ((invoice as any).subscription as string) || null;
          let subscription = null as any;
          if (stripeSubId) {
            subscription = await prisma.subscription.findFirst({ where: { stripeSubscriptionId: stripeSubId } });
          }
          if (subscription) {
            // Idempotency: avoid duplicate payments for the same invoice
            const existing = await prisma.payment.findFirst({ where: { externalId: invoice.id, provider: 'stripe' } });
            if (!existing) {
              await prisma.payment.create({
                data: {
                  subscriptionId: subscription.id,
                  amount: amount,
                  currency: (invoice.currency || 'usd').toLowerCase(),
                  status: 'succeeded',
                  provider: 'stripe',
                  externalId: invoice.id
                }
              });
            }
            await prisma.revenueEvent.create({ data: { subscriptionId: subscription.id, type: 'invoice.payment_succeeded', amount, metadata: { invoiceId: invoice.id } } });
          } else {
            await prisma.revenueEvent.create({ data: { subscriptionId: null, type: 'invoice.payment_succeeded', amount, metadata: { invoiceId: invoice.id } } });
          }
        } catch (err) {
          console.warn('Failed to persist payment invoice.payment_succeeded', err);
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error('Webhook handling error', e);
  }

  return res.status(200).json({ received: true });
}
