import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { prisma } from '../_db';

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
        try {
          const leaseId = session.metadata?.leaseId as string | undefined;
          const tenantId = session.metadata?.tenantId as string | undefined;
          const amount = (session.amount_total || 0) / 100;

          // Idempotency check
          const existing = await prisma.rentPayment.findFirst({ where: { externalId: session.id } });
          if (!existing) {
            await prisma.rentPayment.create({
              data: {
                tenantId: tenantId || '',
                leaseId: leaseId || undefined,
                propertyId: leaseId ? undefined : undefined,
                amount: amount,
                status: 'success',
                gateway: 'stripe',
                externalId: session.id,
              },
            });
          }
        } catch (e) {
          console.error('Failed to persist rent payment from checkout.session.completed', e);
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
