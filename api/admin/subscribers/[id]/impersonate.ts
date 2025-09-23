import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../../pages/api/_db';
import { ensurePermission } from '../../../src/lib/authorize';
import jwt from 'jsonwebtoken';

const SECRET = process.env.SESSION_JWT_SECRET as string;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = ensurePermission(req as any, res as any, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (role !== 'SUPER_ADMIN' && role !== 'SUPERADMIN') return res.status(403).json({ error: 'Forbidden' });

  try {
    const id = String(req.query?.id || '');
    if (!id) return res.status(400).json({ error: 'Missing id' });

    if (req.method === 'POST') {
      // find an admin user for this subscriber
      let subscriberAdmin = await prisma.user.findFirst({ where: { subscriberId: id, role: 'ADMIN' } });
      if (!subscriberAdmin) {
        // fallback: any user for subscriber
        subscriberAdmin = await prisma.user.findFirst({ where: { subscriberId: id } });
      }

      if (!subscriberAdmin) return res.status(404).json({ error: 'Subscriber admin not found' });

      const payload: any = {
        sub: subscriberAdmin.id,
        email: subscriberAdmin.email,
        role: subscriberAdmin.role,
        subscriberId: id,
        impersonatedBy: String((user as any).sub || (user as any).id),
      };

      // create impersonation log
      let logRecord: any = null;
      try {
        logRecord = await prisma.impersonationLog.create({ data: { superAdminId: String((user as any).sub || (user as any).id), targetUserId: subscriberAdmin.id, subscriberId: id } });

        // send audit email if per-subscriber or system config allows
        try {
          const subscriberRec = await prisma.subscriber.findUnique({ where: { id }, select: { impersonationAlerts: true } });
          const sys = await prisma.systemConfig.findFirst();
          const enabled = typeof subscriberRec?.impersonationAlerts !== 'undefined' && subscriberRec?.impersonationAlerts !== null
            ? subscriberRec?.impersonationAlerts
            : sys?.impersonationAlerts ?? true;

          if (enabled) {
            const { sendEmail } = await import('../../../src/lib/mailer');
            const auditTo = process.env.AUDIT_EMAIL;
            if (auditTo) {
              const superAdminEmail = String((user as any).email || (user as any).sub || '');
              await sendEmail({
                to: auditTo,
                subject: `Impersonation Started - subscriber ${id}`,
                text: `Super Admin ${superAdminEmail} started impersonating subscriber ${id} (user ${subscriberAdmin.id}).`,
                html: `<p><strong>Super Admin:</strong> ${superAdminEmail}</p><p><strong>Subscriber:</strong> ${id}</p><p><strong>Impersonated User:</strong> ${subscriberAdmin.id} (${subscriberAdmin.email})</p><p><strong>Started At:</strong> ${new Date().toLocaleString()}</p>`,
              });

              // mark alertSent true on the created log
              try {
                await prisma.impersonationLog.update({ where: { id: logRecord.id }, data: { alertSent: true } });
              } catch (e) {
                // ignore
              }
            }
          }
        } catch (e) {
          // ignore email errors
        }
      } catch (e) {
        // ignore logging errors
      }

      const token = jwt.sign(payload, SECRET, { expiresIn: '15m' });
      return res.status(200).json({ token });
    }

    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  } catch (err: any) {
    console.error('admin subscriber impersonate error', err);
    return res.status(500).json({ error: 'failed' });
  }
}
