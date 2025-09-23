import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '../../../../../pages/api/_db';
import { getSession } from '../../../../lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' });

export async function POST(req: Request) {
  const session = await getSession(req);
  if (!session?.user || session.user.role !== 'TENANT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tenant = await prisma.tenant.findUnique({ where: { userId: session.user.id }, include: { account: true } });
  if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  let stripeCustomerId = tenant.account?.stripeCustomerId;
  if (!stripeCustomerId) {
    const cust = await stripe.customers.create({ email: tenant.email, name: tenant.name, metadata: { tenantId: tenant.id, accountId: tenant.accountId } });
    stripeCustomerId = cust.id;
    if (tenant.accountId) await prisma.account.update({ where: { id: tenant.accountId }, data: { stripeCustomerId } });
  }

  const setupIntent = await stripe.setupIntents.create({ customer: stripeCustomerId, payment_method_types: ['card'] });
  return NextResponse.json({ clientSecret: setupIntent.client_secret });
}
