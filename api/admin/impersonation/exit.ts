import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { ensurePermission } from '../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = ensurePermission(req as any, res as any, '*');
  if (!user) return;

  const role = String((user as any).role || '').toUpperCase();
  if (role !== 'SUPER_ADMIN' && role !== 'SUPERADMIN') return res.status(403).json({ error: 'Forbidden' });

  try {
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const { subscriberId } = body || {};
      if (!subscriberId) return res.status(400).json({ error: 'subscriberId required' });

      const result = await prisma.impersonationLog.updateMany({ where: { superAdminId: String((user as any).sub || (user as any).id), subscriberId, endedAt: null }, data: { endedAt: new Date() } });

      // send audit email if per-subscriber or system config allows
      try {
        const subscriberRec = await prisma.subscriber.findUnique({ where: { id: subscriberId }, select: { impersonationAlerts: true } });
        const sys = await prisma.systemConfig.findFirst();
        const enabled = typeof subscriberRec?.impersonationAlerts !== 'undefined' && subscriberRec?.impersonationAlerts !== null
          ? subscriberRec?.impersonationAlerts
          : sys?.impersonationAlerts ?? true;

        if (enabled) {
          const { sendEmail } = await import('../../src/lib/mailer');
          const auditTo = process.env.AUDIT_EMAIL;
          if (auditTo) {
            const superAdminEmail = String((user as any).email || (user as any).sub || '');
            await sendEmail({
              to: auditTo,
              subject: `Impersonation Ended - subscriber ${subscriberId}`,
              text: `Super Admin ${superAdminEmail} ended impersonation of subscriber ${subscriberId}.`,
              html: `<p><strong>Super Admin:</strong> ${superAdminEmail}</p><p><strong>Subscriber:</strong> ${subscriberId}</p><p><strong>Ended At:</strong> ${new Date().toLocaleString()}</p><p><strong>UpdatedRows:</strong> ${result.count}</p>`,
            });
          }
        }
      } catch (e) {
        // ignore email errors
      }

      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  } catch (err: any) {
    console.error('impersonation exit error', err);
    return res.status(500).json({ error: 'failed' });
  }
}
