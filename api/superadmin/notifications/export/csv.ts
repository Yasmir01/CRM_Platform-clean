import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../../_db';
import { ensurePermission } from '../../../../src/lib/authorize';

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
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    const esc = (s: any) => {
      const str = s === null || s === undefined ? '' : String(s);
      return /[",\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;
    };

    const header = 'Title,Message,Audience,Date\n';
    const rows = notifications
      .map((n) => `${esc(n.title)},${esc(n.message)},${esc(n.audience)},${esc(new Date(n.createdAt).toLocaleString())}`)
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=notifications.csv');
    return res.status(200).send(header + rows);
  } catch (e: any) {
    console.error('notifications export csv error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
