import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { safeParse } from '../src/utils/safeJson';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const secret = process.env.STRIPE_SECRET_KEY;
    const returnUrl = process.env.STRIPE_SUCCESS_URL;
    if (!secret || !returnUrl) return res.status(400).json({ error: 'Stripe not configured' });

    const body = typeof req.body === 'string' ? safeParse(req.body, {}) : req.body;
    const { customerId } = body || {};
    if (!customerId) return res.status(400).json({ error: 'Missing customerId' });

    const stripe = new Stripe(secret, { apiVersion: '2024-06-20' });
    const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe portal error', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err?.message });
  }
}
