import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { ensurePermission } from '../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (!['ADMIN','SUPER_ADMIN'].includes(role)) return res.status(403).json({ error: 'Forbidden' });

  try {
    const q = (req && (req.query || {})) as any;
    const format = (q.format as string) || 'csv';

    const logs = await prisma.escalationLog.findMany({
      include: {
        request: {
          select: {
            id: true,
            title: true,
            status: true,
            property: { select: { id: true, address: true } },
          },
        },
      },
      orderBy: { triggeredAt: 'desc' },
      take: 5000,
    });

    const policies = await prisma.escalationMatrix.findMany({
      orderBy: { level: 'asc' },
      take: 5000,
    });

    if (format === 'json') {
      return res.status(200).json({ logs, policies });
    }

    // Default CSV
    const esc = (s: any) => {
      const str = s === null || s === undefined ? '' : String(s);
      return /[",\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;
    };

    let csv = 'Type,Request/Scope,Level,Role,Detail/Triggered At\n';
    for (const log of logs) {
      const scope = `${log.request?.title || log.request?.id} (${log.request?.property?.address || 'N/A'})`;
      csv += `Escalation,${esc(scope)},${esc(log.level)},${esc(log.role)},${esc(new Date(log.triggeredAt).toISOString())}\n`;
    }
    for (const p of policies) {
      const scope = p.propertyId || p.subscriptionPlanId || 'Global';
      const detail = `+${p.hoursAfterDeadline}h`; 
      csv += `Policy,${esc(scope)},${esc(p.level)},${esc(p.role)},${esc(detail)}\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=compliance_export.csv');
    return res.status(200).send(csv);
  } catch (e: any) {
    console.error('escalations export error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
