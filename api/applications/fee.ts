import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { safeParse } from '../../src/utils/safeJson';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const body = typeof req.body === 'string' ? safeParse(req.body, {}) : (req.body || {});
    const applicantEmail = String(body.applicantEmail || '').trim();
    const propertyId = String(body.propertyId || '').trim();
    const amount = Number.isFinite(body.amount) ? Number(body.amount) : 5000; // cents

    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) return res.status(500).json({ error: 'Stripe not configured' });

    const stripe = new Stripe(secret, { apiVersion: '2024-06-20' });

    const pi = await stripe.paymentIntents.create({
      amount: Math.max(1, Math.round(amount)),
      currency: 'usd',
      metadata: { applicantEmail: applicantEmail || '', propertyId: propertyId || '', type: 'application_fee' },
    });

    return res.status(200).json({ clientSecret: pi.client_secret });
  } catch (e: any) {
    console.error('applications/fee error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
