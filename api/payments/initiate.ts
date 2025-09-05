import { defineHandler } from '../_handler';
import Stripe from 'stripe';
import { z } from 'zod';

const stripeKey = process.env.STRIPE_SECRET_KEY as string | undefined;
const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: '2024-06-20' }) : null;

const Body = z.object({
  orgId: z.string(),
  tenantId: z.string(),
  amountUsd: z.number().min(1),
  invoiceId: z.string().optional(),
});

export default defineHandler({
  methods: ['POST'],
  roles: ['TENANT', 'ADMIN'],
  bodySchema: Body,
  limitKey: 'payments:initiate',
  fn: async ({ res, body, user }) => {
    if (!stripe) {
      return res.status(500).json({ error: 'stripe_not_configured' });
    }

    const key = `tenant:${body.tenantId}:amt:${body.amountUsd}:min:${Math.floor(Date.now() / 60000)}`;
    const intent = await stripe.paymentIntents.create(
      {
        amount: Math.round(body.amountUsd * 100),
        currency: 'usd',
        customer: (user as any)?.stripeCustomerId || undefined,
        metadata: {
          orgId: body.orgId,
          tenantId: body.tenantId,
          invoiceId: body.invoiceId ?? '',
        },
        automatic_payment_methods: { enabled: true },
      },
      { idempotencyKey: key }
    );

    res.json({ ok: true, clientSecret: intent.client_secret });
  },
});
