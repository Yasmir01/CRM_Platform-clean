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

  const stripe = new Stripe(secret, { apiVersion: '2024-06-20' });
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
        // TODO: map session to subscriber/subscription; for now, just log
        console.log('Checkout completed', session.id, customerEmail);
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const amount = (invoice.amount_paid || 0) / 100;
        await prisma.payment.create({ data: { subscriptionId: '', amount, currency: invoice.currency || 'usd', status: 'succeeded', provider: 'stripe', externalId: invoice.id } });
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
