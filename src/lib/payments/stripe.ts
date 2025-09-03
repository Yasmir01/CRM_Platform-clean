import Stripe from 'stripe';
import type { PaymentInput, PaymentProvider, PaymentResult } from './provider';
import { prisma } from '../../../api/_db';

export function stripeProvider(): PaymentProvider {
  const key = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET;
  if (!key) throw new Error('Stripe not configured');
  const stripe = new Stripe(key, { apiVersion: '2024-06-20' });

  return {
    async createPayment(input: PaymentInput): Promise<PaymentResult> {
      const methodTypes = input.method === 'stripe_ach' ? ['us_bank_account'] : ['card'];
      const session = await stripe.checkout.sessions.create({
        payment_method_types: methodTypes as any,
        line_items: [
          {
            price_data: {
              currency: input.currency,
              product_data: { name: `Rent for Lease ${input.leaseId}` },
              unit_amount: Math.round(input.amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${input.returnUrl}?status=success`,
        cancel_url: `${input.returnUrl}?status=cancel`,
      });

      return { id: session.id, status: 'pending', redirectUrl: session.url || '' };
    },

    async handleWebhook(req: Request): Promise<void> {
      const sig = req.headers.get('stripe-signature');
      const secret = process.env.STRIPE_WEBHOOK_SECRET as string | undefined;
      let event: Stripe.Event | null = null;
      try {
        if (sig && secret) {
          const buf = Buffer.from(await req.arrayBuffer());
          event = stripe.webhooks.constructEvent(buf, sig, secret);
        } else {
          const json = await req.json();
          event = json as any;
        }
      } catch (e) {
        console.error('stripe webhook parse error', (e as any)?.message || e);
        return;
      }

      if (!event) return;

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        const txId = String(session.id);
        try {
          await prisma.rentPayment.updateMany({ where: { transactionId: txId }, data: { status: 'succeeded', paidAt: new Date() } });
        } catch (e) {
          console.error('rentPayment update error', (e as any)?.message || e);
        }
      }
    },
  };
}
