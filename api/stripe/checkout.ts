import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { prisma } from './_db';
import { getUserOr401 } from '../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const userPayload = getUserOr401(req, res);
  if (!userPayload) return;

  const userId = String(userPayload.sub || userPayload?.id || '');
  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!dbUser) return res.status(401).json({ error: 'Unauthorized' });
  if (!dbUser.accountId) return res.status(400).json({ error: 'User has no account' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const priceId = String(body.priceId || '');
    if (!priceId) return res.status(400).json({ error: 'Missing priceId' });

    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) return res.status(500).json({ error: 'Stripe not configured' });

    const stripe = new Stripe(secret, { apiVersion: '2024-06-20' });

    const successUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.STRIPE_SUCCESS_URL || `https://${req.headers.host}/crm/settings`;
    const cancelUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.STRIPE_CANCEL_URL || `https://${req.headers.host}/crm/settings`;

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: dbUser.email || undefined,
      metadata: { accountId: dbUser.accountId, priceId },
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('stripe checkout error', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
