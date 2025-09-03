import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';
import { stripe } from '../../src/lib/stripe';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method Not Allowed' }); }
  const auth = getUserOr401(req, res); if (!auth) return;
  const tenantId = String((auth as any).sub || (auth as any).id);

  if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const installmentId = String(body.installmentId || '');
  const amount = Number(body.amount || 0);
  if (!installmentId || amount <= 0) return res.status(400).json({ error: 'invalid input' });

  const inst = await prisma.paymentPlanInstallment.findUnique({ where: { id: installmentId }, include: { plan: true } });
  if (!inst || inst.plan.tenantId !== tenantId) return res.status(404).json({ error: 'not found' });
  const remaining = Math.max(0, inst.amount - inst.paidAmount);
  if (amount > remaining) return res.status(400).json({ error: 'amount exceeds remaining' });

  const user = await prisma.user.findUnique({ where: { id: tenantId } });
  if (!user) return res.status(401).json({ error: 'unauthorized' });

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const c = await stripe.customers.create({ email: user.email });
    customerId = c.id;
    await prisma.user.update({ where: { id: tenantId }, data: { stripeCustomerId: customerId } });
  }

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    customer: customerId!,
    automatic_payment_methods: { enabled: true },
    metadata: { tenantId, orgId: user.orgId, type: 'rent_plan', planId: inst.planId, installmentId: inst.id },
  });

  return res.status(200).json({ clientSecret: intent.client_secret });
}
