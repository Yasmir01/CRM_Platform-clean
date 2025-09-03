import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { ensurePermission } from '../../src/lib/authorize';

const stripeSecret = process.env.STRIPE_SECRET_KEY as string | undefined;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: '2022-11-15' }) : (null as any);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');

  const user = ensurePermission(req, res, 'payments:read');
  if (!user) return;

  if (!stripeSecret || !stripe) return res.status(200).json([]);

  const tenantId = String((user as any).sub || (user as any).id);

  try {
    const list = await stripe.paymentIntents.list({ limit: 50 });
    const filtered = list.data.filter((pi) => (pi.metadata?.tenantId || '') === tenantId);
    const resp = filtered.map((pi) => ({
      id: pi.id,
      amount: pi.amount,
      currency: pi.currency,
      status: pi.status,
      created: pi.created,
    }));
    return res.status(200).json(resp);
  } catch (err: any) {
    console.error('tenant/payments error', err?.message || err);
    return res.status(500).json({ error: 'failed' });
  }
}
