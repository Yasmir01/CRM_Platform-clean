import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../src/utils/authz';
import { prisma } from '../_db';
import { getPaymentProvider } from '../../src/lib/payments/factory';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const user = getUserOr401(req, res);
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  const roles = Array.isArray((user as any).roles) ? (user as any).roles.map((r: string) => String(r).toUpperCase()) : [];
  const isTenant = role === 'TENANT' || roles.includes('TENANT');
  if (!isTenant) return res.status(401).json({ error: 'Unauthorized' });

  const dbUser = await prisma.user.findUnique({ where: { id: String((user as any).sub) } });
  if (!dbUser) return res.status(401).json({ error: 'Unauthorized' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const amount = Number(body.amount || 0);
  const provider = String(body.provider || 'stripe');
  const methodId = body.methodId ? String(body.methodId) : undefined;

  try {
    const providerImpl = getPaymentProvider(provider as any);
    const customerId = provider === 'stripe' || provider === 'applepay' ? (dbUser.stripeCustomerId || '') : String(dbUser.id);
    const result = await providerImpl.createPayment(amount, customerId, methodId);

    const payment = await prisma.rentPayment.create({
      data: {
        tenantId: dbUser.id,
        amount,
        status: 'success',
        gateway: provider,
        methodId: methodId || null,
      },
    });

    return res.status(200).json({ ok: true, payment, providerResponse: result });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || 'Payment failed' });
  }
}
