import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../src/utils/authz';
import { prisma } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');
  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    const userId = String((user as any).sub || user.id || '');
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser) return res.status(401).json({ error: 'Unauthorized' });

    const accountId = (dbUser as any).accountId || (dbUser as any).orgId || null;
    let propertyIds: string[] = [];
    if (accountId) {
      const props = await prisma.property.findMany({ where: { accountId: String(accountId) }, select: { id: true } });
      propertyIds = props.map((p) => p.id);
    }

    // Collect recent payments and invoices
    const paymentsWhere: any = {};
    if (propertyIds.length) paymentsWhere.propertyId = { in: propertyIds };

    const payments = await prisma.rentPayment.findMany({ where: paymentsWhere, include: { tenant: true }, orderBy: { createdAt: 'desc' }, take: 1000 });
    const invoices = await prisma.maintenanceInvoice.findMany({ where: propertyIds.length ? { propertyId: { in: propertyIds } } : {}, orderBy: { createdAt: 'desc' }, take: 1000 }).catch(() => [] as any[]);

    // Prepare CSV rows
    const rows: string[] = [];
    rows.push('type,id,date,property,tenant,amount,status,method,description');

    for (const p of payments) {
      const line = [
        'payment',
        p.id,
        (p.createdAt || new Date()).toISOString(),
        p.propertyId || '',
        (p.tenant && (p.tenant.name || p.tenant.email)) || '',
        Number(p.amount || 0).toFixed(2),
        p.status || '',
        p.gateway || '',
        (p.note || p.description || '').toString().replace(/\n/g, ' ').replace(/,/g, ' '),
      ];
      rows.push(line.map((v) => `"${String(v || '').replace(/"/g, '""')}"`).join(','));
    }

    for (const inv of invoices) {
      const line = [
        'invoice',
        inv.id,
        (inv.createdAt || new Date()).toISOString(),
        inv.propertyId || '',
        inv.tenantId || '',
        Number(inv.amount || 0).toFixed(2),
        inv.status || '',
        inv.method || '',
        (inv.description || '').toString().replace(/\n/g, ' ').replace(/,/g, ' '),
      ];
      rows.push(line.map((v) => `"${String(v || '').replace(/"/g, '""')}"`).join(','));
    }

    const csv = rows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="accounting-export.csv"');
    res.status(200).send(csv);
    return;
  } catch (e: any) {
    console.error('accounting/export error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
