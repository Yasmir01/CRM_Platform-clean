import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_db';
import { getUserOr401 } from '../src/utils/authz';
import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = getUserOr401(req, res);
  if (!user) return;
  const userId = String((user as any).sub || (user as any).id || '');
  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!dbUser) return res.status(401).json({ error: 'Unauthorized' });
  if (String(dbUser.role || '').toUpperCase() !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });

  try {
    const format = String((req.query as any).format || 'csv').toLowerCase();
    const q = String((req.query as any).search || '').trim();
    const status = String((req.query as any).status || 'all').toLowerCase();
    const from = (req.query as any).from as string | undefined;
    const to = (req.query as any).to as string | undefined;
    const take = Math.min(2000, Number((req.query as any).take || 1000));

    const where: any = {};
    if (status === 'sent') where.alertSent = true;
    if (status === 'suppressed') where.alertSent = false;

    if (from || to) {
      where.startedAt = {};
      if (from) {
        const fromDate = new Date(from);
        if (!isNaN(fromDate.getTime())) where.startedAt.gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        if (!isNaN(toDate.getTime())) where.startedAt.lte = toDate;
      }
    }

    if (q) {
      const qLower = q.toLowerCase();
      where.OR = [
        { superAdminId: { contains: qLower, mode: 'insensitive' } },
        { subscriberId: { contains: qLower, mode: 'insensitive' } },
        { targetUserId: { contains: qLower, mode: 'insensitive' } },
        { superAdmin: { email: { contains: qLower, mode: 'insensitive' } } },
        { subscriber: { name: { contains: qLower, mode: 'insensitive' } } },
        { targetUser: { email: { contains: qLower, mode: 'insensitive' } } },
      ];
    }

    const logs = await prisma.impersonationLog.findMany({
      where,
      include: {
        superAdmin: { select: { id: true, email: true, name: true } },
        subscriber: { select: { id: true, email: true, name: true, companyName: true } },
        targetUser: { select: { id: true, email: true, name: true } },
      },
      orderBy: { startedAt: 'desc' },
      take: take || 1000,
    });

    if (format === 'csv') {
      const rows = logs.map((l) => ({
        id: l.id,
        superAdminId: l.superAdminId,
        superAdminEmail: l.superAdmin?.email || '',
        superAdminName: l.superAdmin?.name || '',
        subscriberId: l.subscriberId || '',
        subscriberName: l.subscriber?.name || l.subscriber?.companyName || '',
        targetUserId: l.targetUserId,
        targetUserEmail: l.targetUser?.email || '',
        startedAt: l.startedAt.toISOString(),
        endedAt: l.endedAt ? l.endedAt.toISOString() : '',
        alertSent: l.alertSent ? 'Sent' : 'Suppressed',
      }));

      const fields = [
        'id', 'superAdminId', 'superAdminEmail', 'superAdminName', 'subscriberId', 'subscriberName', 'targetUserId', 'targetUserEmail', 'startedAt', 'endedAt', 'alertSent'
      ];
      const parser = new Parser({ fields });
      const csv = parser.parse(rows as any);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=impersonation_logs.csv');
      return res.status(200).send(csv);
    }

    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 36 });
      const chunks: Buffer[] = [];
      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => {
        const pdf = Buffer.concat(chunks);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=impersonation_logs.pdf');
        return res.status(200).send(pdf);
      });

      doc.fontSize(18).text('Impersonation Logs', { align: 'center' }).moveDown();
      logs.forEach((l) => {
        const time = new Date(l.startedAt).toLocaleString();
        const ended = l.endedAt ? new Date(l.endedAt).toLocaleString() : 'Active';
        const sa = l.superAdmin?.email || l.superAdminId;
        const sub = l.subscriber?.companyName || l.subscriber?.name || l.subscriberId || '';
        const tgt = l.targetUser?.email || l.targetUserId;
        const status = l.alertSent ? 'Sent' : 'Suppressed';
        doc.fontSize(12).text(`${time} — SA: ${sa} → Target: ${tgt} → Subscriber: ${sub} — ${status}`);
        doc.moveDown(0.25);
      });

      doc.end();
      return; // response handled in 'end' listener
    }

    return res.status(400).json({ error: 'Invalid format' });
  } catch (err: any) {
    console.error('Export error:', err?.message || err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
