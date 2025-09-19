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
    const { safeParse } = await import('../src/utils/safeJson');
    const body = typeof req.body === 'string' ? safeParse(req.body, {}) : (req.body || {});
    const plan = String((body.plan || '').toLowerCase() || '');
    const suppliedPriceId = String(body.priceId || '');

    // Price mapping provided by user
    const priceMap: Record<string, string> = {
      basic: 'price_1S8nebJmsBh8kkKukov2pqNI',
      pro: 'price_1S8nfLJmsBh8kkKuaFkqiD5c',
      enterprise: 'price_1S8ngqJmsBh8kkKuHphcNyHd',
    };

    // Prefer explicit priceId, fall back to plan mapping
    const priceId = suppliedPriceId || (plan ? priceMap[plan] : '');
    if (!priceId) return res.status(400).json({ error: 'Missing priceId or plan' });

    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) return res.status(500).json({ error: 'Stripe not configured' });

    const stripe = new Stripe(secret, { apiVersion: '2024-06-20' });

    const successUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.STRIPE_SUCCESS_URL || `https://${req.headers.host}/crm/settings`;
    const cancelUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.STRIPE_CANCEL_URL || `https://${req.headers.host}/crm/settings`;

    // determine seat count
    const account = await prisma.account.findUnique({ where: { id: dbUser.accountId }, include: { users: true } });
    const seatCount = (account?.users || []).length || 1;

    const perSeatPrice = process.env.STRIPE_PRICE_PER_SEAT;

    const line_items: any[] = [{ price: priceId, quantity: 1 }];
    if (perSeatPrice) {
      line_items.push({ price: perSeatPrice, quantity: seatCount });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items,
      subscription_data: { metadata: { accountId: dbUser.accountId, priceId, plan: plan || null } },
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: dbUser.email || undefined,
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('stripe checkout error', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
