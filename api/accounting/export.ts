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

    // Collect payments and maintenance invoices
    const paymentsWhere: any = {};
    if (propertyIds.length) paymentsWhere.propertyId = { in: propertyIds };

    const payments = await prisma.rentPayment.findMany({ where: paymentsWhere, include: { tenant: true }, orderBy: { createdAt: 'desc' }, take: 1000 });
    const invoices = await prisma.maintenanceInvoice.findMany({ where: { propertyId: propertyIds.length ? { in: propertyIds } : undefined }, orderBy: { createdAt: 'desc' }, take: 1000 }).catch(() => [] as any[]);

    // Prepare CSV
    const rows: string[] = [];
    rows.push('type,id,date,property,tenant,amount,status,method,description');

    for (const p of payments) {
      const line = [
        'payment',
        `