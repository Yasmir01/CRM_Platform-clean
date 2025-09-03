import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';
import { stripe } from '../../src/lib/stripe';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method Not Allowed' }); }
  const auth = getUserOr401(req, res); if (!auth) return;
  const userId = String((auth as any).sub || (auth as any).id);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  if (!['ADMIN','MANAGER','SUPER_ADMIN'].includes(user.role as any)) return res.status(403).json({ error: 'forbidden' });

  const id = String((req.query?.id as string) || '');
  if (!id) return res.status(400).json({ error: 'id required' });

  const a = await prisma.autopayAttempt.findUnique({ where: { id }, include: { tenant: true } });
  if (!a || !a.tenant?.stripeCustomerId || !a.tenant?.defaultPmId) return res.status(400).json({ error: 'Not retryable' });
  if (!stripe) return res.status(500).json({ error: 'Stripe not configured' });

  try {
    await stripe.paymentIntents.create({ amount: Math.round(a.amount * 100), currency: 'usd', customer: a.tenant.stripeCustomerId, payment_method: a.tenant.defaultPmId, off_session: true, confirm: true, metadata: { tenantId: a.tenantId, leaseId: a.leaseId, type: 'rent_autopay_manual_retry' } });
    await prisma.autopayAttempt.update({ where: { id: a.id }, data: { status: 'succeeded' } });
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}
