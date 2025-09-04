import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';
import { notify } from '../../src/lib/notify';

const ESCALATION_TIERS = [
  { level: 1, role: 'ADMIN', hoursAfterDeadline: 0 },
  { level: 2, role: 'MANAGER', hoursAfterDeadline: 24 },
  { level: 3, role: 'SUPER_ADMIN', hoursAfterDeadline: 48 },
] as const;

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

    for (const r of requests) {
      if (!r.deadline) continue;
      const hoursOverdue = (now.getTime() - r.deadline.getTime()) / 36e5;

      for (const tier of ESCALATION_TIERS) {
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
