import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';
import { notify } from '../../src/lib/notify';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Allow admins/managers/superadmins to trigger manually; could be run via cron, too
  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    const now = new Date();

    const overdue = await prisma.maintenanceRequest.findMany({
      where: { deadline: { lte: now }, status: { not: 'completed' }, escalated: false },
      select: { id: true, title: true, propertyId: true },
    });

    if (overdue.length === 0) return res.status(200).json({ escalated: 0 });

    await prisma.maintenanceRequest.updateMany({
      where: { id: { in: overdue.map((r) => r.id) } },
      data: { escalated: true, escalatedAt: now },
    });

    try {
      const admins = await prisma.user.findMany({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] as any } }, select: { id: true, email: true, name: true } });
      const msg = `${overdue.length} maintenance request(s) are overdue and escalated.`;
      await Promise.all(
        admins.map((a) =>
          notify({ userId: a.id, type: 'maintenance_escalation', title: 'Maintenance Escalation', message: msg, meta: { count: overdue.length } })
        )
      );
    } catch (_) {}

    return res.status(200).json({ escalated: overdue.length });
  } catch (e: any) {
    console.error('maintenance escalate error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
