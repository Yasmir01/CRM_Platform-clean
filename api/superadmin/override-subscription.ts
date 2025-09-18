import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { ensurePermission } from '../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const userId = String(body.userId || '');
    const plan = String((body.plan || '').toLowerCase() || '');

    if (!userId || !plan) return res.status(400).json({ error: 'Missing userId or plan' });

    // Update user subscription fields
    const validPlans = new Set(['free', 'basic', 'pro', 'enterprise']);
    if (!validPlans.has(plan)) return res.status(400).json({ error: 'Invalid plan' });

    await prisma.user.update({ where: { id: userId }, data: { subscriptionPlan: plan, subscriptionStatus: 'active' } as any });

    // Also update Subscription record if exists
    try {
      const sub = await prisma.subscription.findFirst({ where: { userId } });
      if (sub) {
        await prisma.subscription.update({ where: { id: sub.id }, data: { plan, status: 'active' } as any });
      } else {
        await prisma.subscription.create({ data: { userId, plan, status: 'active' } as any });
      }
    } catch (e) {
      console.warn('Failed to upsert subscription record during override', e);
    }

    // Record action in logs if superAdminAction model exists (best-effort)
    try {
      if ((prisma as any).superAdminAction) {
        await (prisma as any).superAdminAction.create({ data: { userId: String((user as any).sub || (user as any).id), action: 'override_subscription', details: JSON.stringify({ targetUserId: userId, plan }) } }).catch(() => null);
      }
    } catch (_) {}

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('superadmin override-subscription error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
