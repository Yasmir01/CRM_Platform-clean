import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { prisma } from '../../api/_db';
import { getUserOr401 } from '../../src/utils/authz';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2024-06-20' } as any);

function isTenant(user: any) {
  const role = String(user.role || '').toUpperCase();
  const roles = Array.isArray(user.roles) ? user.roles.map((r: string) => String(r).toUpperCase()) : [];
  return role === 'TENANT' || roles.includes('TENANT');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;
  if (!isTenant(user)) return res.status(401).json({ error: 'Unauthorized' });

  const userId = String((user as any).sub || (user as any).id || '');
  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!dbUser) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const methods = await prisma.paymentMethod.findMany({ where: { tenantId: dbUser.id }, orderBy: { createdAt: 'desc' } });
    return res.status(200).json(methods);
  }

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const paymentMethodId = String(body.paymentMethodId || '');
      if (!paymentMethodId) return res.status(400).json({ error: 'Missing paymentMethodId' });
      if (!dbUser.stripeCustomerId) return res.status(400).json({ error: 'No Stripe customer' });

      await stripe.paymentMethods.attach(paymentMethodId, { customer: dbUser.stripeCustomerId });
      await stripe.customers.update(dbUser.stripeCustomerId, { invoice_settings: { default_payment_method: paymentMethodId } });

      const pm = await stripe.paymentMethods.retrieve(paymentMethodId);

      await prisma.paymentMethod.updateMany({ where: { tenantId: dbUser.id, isDefault: true }, data: { isDefault: false } });

      const dbPM = await prisma.paymentMethod.create({
        data: {
          tenantId: dbUser.id,
          provider: 'stripe',
          methodId: paymentMethodId,
          type: (pm as any).type || 'card',
          last4: (pm as any).card?.last4 || null,
          brand: (pm as any).card?.brand || null,
          isDefault: true,
        },
      });

      return res.status(201).json(dbPM);
    } catch (e: any) {
      return res.status(400).json({ error: e?.message || 'Failed to add payment method' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const id = String(body.id || '');
      if (!id) return res.status(400).json({ error: 'Missing id' });

      const pm = await prisma.paymentMethod.findUnique({ where: { id } });
      if (!pm || pm.tenantId !== dbUser.id) return res.status(404).json({ error: 'Not found' });

      if (pm.provider === 'stripe' && dbUser.stripeCustomerId) {
        try {
          await stripe.paymentMethods.detach(pm.methodId);
        } catch {
          // ignore detach errors
        }
      }

      await prisma.paymentMethod.delete({ where: { id } });
      return res.status(200).json({ ok: true });
    } catch (e: any) {
      return res.status(400).json({ error: e?.message || 'Failed to delete payment method' });
    }
  }

  res.setHeader('Allow', 'GET,POST,DELETE');
  return res.status(405).json({ error: 'Method Not Allowed' });
}
