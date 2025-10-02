import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { ensurePermission } from '../../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (role !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });

  try {
    const logs = await prisma.impersonationLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: 500,
    });

    const rows: (string | number | boolean | null)[][] = [
      ['ID', 'SuperAdminId', 'AdminId', 'TargetUserId', 'StartedAt', 'EndedAt', 'Notified'],
      ...logs.map((l) => [
        l.id,
        l.superAdminId || '',
        l.adminId || '',
        l.targetUserId,
        l.startedAt.toISOString(),
        l.endedAt ? l.endedAt.toISOString() : '',
        l.notified,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((v) => {
            const s = v === null || v === undefined ? '' : String(v);
            return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
          })
          .join(',')
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=compliance.csv');
    return res.status(200).send(csv);
  } catch (e: any) {
    console.error('superadmin/compliance/export error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
