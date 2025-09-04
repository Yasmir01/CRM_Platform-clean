import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { ensurePermission } from '../../src/lib/authorize';
import { prisma } from '../_db';

const stripeSecret = process.env.STRIPE_SECRET_KEY as string | undefined;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2022-11-15' }) : (null as any);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const user = ensurePermission(req, res, 'payments:create');
  if (!user) return;

  if (!stripeSecret || !stripe) return res.status(500).json({ error: 'STRIPE_SECRET_KEY not set' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const rawAmount = Number(body.amount);
  const currency = (body.currency || 'usd') as string;
  const description = (body.description || '') as string;

  if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
    return res.status(400).json({ error: 'invalid amount' });
  }

  // Convert to smallest currency unit (e.g., cents)
  const amount = Math.round(rawAmount < 100 && rawAmount % 1 !== 0 ? rawAmount * 100 : rawAmount >= 1 && rawAmount < 1000 ? Math.round(rawAmount * 100) : rawAmount);

  try {
    const tenantId = String((user as any).sub || (user as any).id);
    const pi = await stripe.paymentIntents.create({
      amount,
      currency,
      description,
      metadata: { tenantId },
      automatic_payment_methods: { enabled: true },
    });

    try {
      await prisma.rentPayment.create({
        data: {
          tenantId,
          amount: rawAmount,
          status: 'pending',
          autopay: false,
        },
      });
    } catch (e) {
      console.warn('failed to persist rentPayment pending record', (e as any)?.message || e);
    }

    return res.status(200).json({ clientSecret: pi.client_secret });
  } catch (err: any) {
    console.error('create-payment-intent error', err?.message || err);
    return res.status(500).json({ error: 'payment-init-failed' });
  }
}
