import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../src/utils/authz';
import { prisma } from '../_db';
import { getActiveLeaseForTenant } from '../../src/lib/tenant';
import { stripe } from '../../src/lib/stripe';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  const auth = getUserOr401(req, res);
  if (!auth) return;
  const tenantId = String((auth as any).sub || (auth as any).id);

  const [lease, prefs] = await Promise.all([
    getActiveLeaseForTenant(tenantId),
    prisma.tenantPreferences.findUnique({ where: { userId: tenantId } }),
  ]);

  let lastPayment: any = null;
  try {
    if (stripe) {
      const list = await stripe.paymentIntents.list({ limit: 10 });
      const filtered = list.data.filter((pi) => (pi.metadata?.tenantId || '') === tenantId);
      const latest = filtered.sort((a, b) => (a.created < b.created ? 1 : -1))[0];
      if (latest) lastPayment = { amount: (latest.amount || 0) / 100, date: new Date((latest.created || 0) * 1000).toISOString() };
    }
  } catch {}

  let nextDueLabel: string | null = null;
  if (lease?.dueDay) {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), lease.dueDay);
    if (next.getTime() < now.getTime()) next.setMonth(next.getMonth() + 1);
    nextDueLabel = next.toLocaleDateString();
  }

  return res.status(200).json({
    rentAmount: lease?.rentAmount ?? null,
    nextDueLabel,
    lastPayment,
    autopayEnabled: !!prefs?.autopayEnabled,
  });
}
