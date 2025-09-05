import { prisma } from '../_db';
import { getEscalationPolicy } from './escalation';
import { notify } from '../../src/lib/notify';

async function sendRoleNotification(opts: { role: string; subject: string; message: string; orgId?: string | null }) {
  const where: any = { role: opts.role as any };
  if (opts.orgId) where.orgId = opts.orgId;
  const users = await prisma.user.findMany({ where, select: { id: true } });
  await Promise.all(
    users.map((u) =>
      notify({ userId: u.id, type: 'maintenance_escalation', title: opts.subject, message: opts.message })
    )
  );
}

export async function runEscalations() {
  const now = new Date();

  const requests = await prisma.maintenanceRequest.findMany({
    where: { status: { not: 'completed' }, deadline: { not: null } },
    select: { id: true, title: true, propertyId: true, orgId: true, deadline: true },
    take: 2000,
  });

  const orgPlanCache = new Map<string, string | null>();
  const planNameToId = new Map<string, string | null>();

  for (const req of requests) {
    if (!req.deadline) continue;
    const overdueHours = (now.getTime() - req.deadline.getTime()) / 36e5;
    if (overdueHours < 0) continue;

    let planId: string | null = null;
    if (req.orgId) {
      if (orgPlanCache.has(req.orgId)) {
        planId = orgPlanCache.get(req.orgId) || null;
      } else {
        const org = await prisma.organization.findUnique({ where: { id: req.orgId }, select: { plan: true } });
        if (org && org.plan) {
          if (planNameToId.has(org.plan)) {
            planId = planNameToId.get(org.plan) || null;
          } else {
            const plan = await prisma.subscriptionPlan.findFirst({ where: { name: org.plan }, select: { id: true } });
            planId = plan ? plan.id : null;
            planNameToId.set(org.plan, planId);
          }
        }
        orgPlanCache.set(req.orgId, planId);
      }
    }

    const policy = await getEscalationPolicy(req.propertyId, planId);

    for (const level of policy) {
      const already = await prisma.escalationLog.findFirst({ where: { requestId: req.id, level: level.level } });
      if (!already && overdueHours >= level.hoursAfterDeadline) {
        await prisma.escalationLog.create({
          data: { requestId: req.id, level: level.level, role: level.role, triggeredAt: now },
        });

        await sendRoleNotification({
          role: level.role,
          subject: `Escalation Level ${level.level} - Request #${req.id}`,
          message: `Maintenance request "${req.title}" is overdue by ${Math.floor(overdueHours)}h. Escalation triggered at level ${level.level}.`,
          orgId: req.orgId || null,
        });

        // Also mark request latest escalationLevel for dashboard badge
        await prisma.maintenanceRequest.update({ where: { id: req.id }, data: { escalated: true, escalatedAt: now, escalationLevel: level.level } });
      }
    }
  }

  return { processed: requests.length };
}
