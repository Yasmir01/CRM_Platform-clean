import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { prisma } from '../_db';
import { getUserOr401 } from '../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const userPayload = getUserOr401(req, res);
  if (!userPayload) return;

  const roles: string[] = Array.isArray(userPayload.roles) ? userPayload.roles : [String(userPayload.role || '')];
  const isTenant = roles.map(r => String(r).toUpperCase()).includes('TENANT');
  if (!isTenant) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const leaseId = body.leaseId ? String(body.leaseId) : null;
    if (!leaseId) return res.status(400).json({ error: 'Missing leaseId' });

    const lease = await prisma.lease.findUnique({ where: { id: leaseId }, include: { tenant: true, unit: { include: { property: true } }, property: true } });
    if (!lease) return res.status(404).json({ error: 'Lease not found' });

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) return res.status(500).json({ error: 'Stripe not configured' });

    const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });

    const amount = Math.round((lease.rentAmount || 0) * 100);

    const successUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.STRIPE_SUCCESS_URL || (`${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/tenant/dashboard?success=1`);
    const cancelUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.STRIPE_CANCEL_URL || (`${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/tenant/dashboard?canceled=1`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: lease.tenant?.email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `Rent for ${(lease as any).unit?.property?.title || lease.property?.title || lease.property?.address || 'Lease'}` },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        leaseId: lease.id,
        tenantId: lease.tenantId || lease.tenant?.id || userPayload.sub || userPayload?.id,
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('checkout create error', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
