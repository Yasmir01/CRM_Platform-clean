import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';
import { stripe } from '../../src/lib/stripe';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method Not Allowed' }); }
  const auth = getUserOr401(req, res); if (!auth) return;
  const userId = String((auth as any).sub || (auth as any).id);

  if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ error: 'unauthorized' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const leaseId = String(body.leaseId || '');
  const amount = Number(body.amount || 0);
  const dayOfMonth = Number(body.dayOfMonth || 0);
  const method = String(body.method || 'stripe_card');
  if (!leaseId || !amount || !dayOfMonth) return res.status(400).json({ error: 'missing fields' });

  let customerId = user.stripeCustomerId || null;
  if (!customerId) {
    const c = await stripe.customers.create({ email: user.email });
    customerId = c.id;
    await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: customerId } });
  }

  const si = await stripe.setupIntents.create({ customer: customerId!, payment_method_types: method === 'stripe_ach' ? ['us_bank_account'] : ['card'], usage: 'off_session' });

  const ap = await prisma.autoPay.create({ data: { tenantId: userId, leaseId, amount, dayOfMonth, method } });

  return res.status(200).json({ clientSecret: si.client_secret, autoPayId: ap.id });
}
