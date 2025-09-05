import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';
import { notify } from '../../src/lib/notify';
import { getEscalationPolicy } from '../_lib/escalation';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Allow admins/managers/superadmins to trigger manually; could be run via cron
  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    const now = new Date();

    const requests = await prisma.maintenanceRequest.findMany({
      where: { status: { not: 'completed' }, deadline: { not: null } },
      select: { id: true, title: true, propertyId: true, orgId: true, deadline: true, escalationLevel: true },
      take: 1000,
    });

    let escalatedCount = 0;

    // Cache orgId -> planId and planName -> id to reduce queries
    const orgPlanCache = new Map<string, string | null>();
    const planNameToId = new Map<string, string | null>();

    for (const r of requests) {
      if (!r.deadline) continue;
      const hoursOverdue = (now.getTime() - r.deadline.getTime()) / 36e5;

      let planId: string | null = null;
      if (r.orgId) {
        if (orgPlanCache.has(r.orgId)) {
          planId = orgPlanCache.get(r.orgId) || null;
        } else {
          const org = await prisma.organization.findUnique({ where: { id: r.orgId }, select: { plan: true } });
          if (org && org.plan) {
            if (planNameToId.has(org.plan)) {
              planId = planNameToId.get(org.plan) || null;
            } else {
              const plan = await prisma.subscriptionPlan.findFirst({ where: { name: org.plan }, select: { id: true } });
              planId = plan ? plan.id : null;
              planNameToId.set(org.plan, planId);
            }
          }
          orgPlanCache.set(r.orgId, planId);
        }
      }

      const tiers = await getEscalationPolicy(r.propertyId, planId);

      for (const tier of tiers) {
        if (hoursOverdue >= tier.hoursAfterDeadline && (r.escalationLevel || 0) < tier.level) {
          await prisma.maintenanceRequest.update({
            where: { id: r.id },
            data: { escalationLevel: tier.level, escalated: true, escalatedAt: now },
          });

          // Notify users at the appropriate tier; scope by org when available
          const where: any = { role: tier.role as any };
          if (r.orgId) where.orgId = r.orgId;
          const recipients = await prisma.user.findMany({ where, select: { id: true, email: true, name: true } });

          const msg = `Request "${r.title}" is overdue (${hoursOverdue.toFixed(1)}h) at ${r.propertyId || 'unknown property'}. Escalation level: ${tier.role}.`;
          await Promise.all(
            recipients.map((a) =>
              notify({ userId: a.id, type: 'maintenance_escalation', title: 'Maintenance Escalation', message: msg, meta: { requestId: r.id, level: tier.level } })
            )
          );

          escalatedCount++;
        }
      }
    }

    return res.status(200).json({ escalated: escalatedCount });
  } catch (e: any) {
    console.error('maintenance escalate error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
