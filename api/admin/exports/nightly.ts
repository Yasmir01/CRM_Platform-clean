import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { permissions as roleDefaults } from '../../../src/lib/permissions';
import { exportToCSVFile, exportToPDFFile } from '../../../src/lib/exportFileUtils';
import { sendMail } from '../../../src/lib/mailer';
import { isAuthorizedAdmin } from '../../_auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow Vercel Cron trigger or manual admin token
  const isCron = Boolean((req.headers['x-vercel-cron'] as string) || (req.headers['X-Vercel-Cron'] as any));
  if (!isCron && !isAuthorizedAdmin(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, permissions: true, name: true },
    });

    const enriched = users.map((u) => {
      let activePerms: string[] = [];
      if (u.permissions) {
        activePerms = u.permissions.split(',').map((p) => p.trim()).filter(Boolean);
      } else {
        // @ts-expect-error enum index
        activePerms = (roleDefaults as any)[u.role] || [];
      }
      return { ...u, activePerms };
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const csvPath = await exportToCSVFile(enriched, `/tmp/user_permissions-${timestamp}.csv`);
    const pdfPath = await exportToPDFFile(enriched, `/tmp/user_permissions-${timestamp}.pdf`);

    const admins = users.filter((u) => u.role === 'ADMIN').map((u) => u.email).filter(Boolean);

    if (admins.length === 0) {
      return res.status(200).json({ ok: true, info: 'No admin recipients found' });
    }

    await sendMail(
      admins,
      'Nightly User Permissions Report',
      'Attached are the latest user roles and permissions.',
      [
        { filename: 'user_permissions.csv', path: csvPath },
        { filename: 'user_permissions.pdf', path: pdfPath },
      ]
    );

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('nightly export error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
