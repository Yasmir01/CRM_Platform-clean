import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../src/utils/authz';
import { prisma } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    const userId = String((user as any).sub || user.id || '');
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser) return res.status(401).json({ error: 'Unauthorized' });

    // Scope by accountId or orgId if available
    const accountId = (dbUser as any).accountId || (dbUser as any).orgId || null;

    // Determine property ids in scope
    let propertyIds: string[] = [];
    if (accountId) {
      const props = await prisma.property.findMany({ where: { accountId: String(accountId) }, select: { id: true } });
      propertyIds = props.map((p) => p.id);
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Rent collected (month-to-date)
    const rentWhere: any = { createdAt: { gte: startOfMonth } };
    if (propertyIds.length) rentWhere.propertyId = { in: propertyIds };
    const rentAgg = await prisma.rentPayment.aggregate({ _sum: { amount: true }, where: rentWhere });
    const rentCollected = Number(rentAgg._sum.amount || 0);

    // Outstanding balances: sum tenant.balance for tenants in properties
    let outstanding = 0;
    try {
      const tenantWhere: any = {};
      if (propertyIds.length) tenantWhere.propertyId = { in: propertyIds };
      const balAgg = await prisma.tenant.aggregate({ _sum: { balance: true }, where: tenantWhere });
      outstanding = Number(balAgg._sum.balance || 0);
    } catch (e) { /* ignore */ }

    // Expenses (maintenance invoices approved/paid)
    const invoiceWhere: any = {};
    if (propertyIds.length) invoiceWhere.propertyId = { in: propertyIds };
    invoiceWhere.status = { in: ['approved', 'paid', 'completed'] };
    const expenseAgg = await prisma.maintenanceInvoice.aggregate({ _sum: { amount: true }, where: invoiceWhere }).catch(() => ({ _sum: { amount: 0 } } as any));
    const expenses = Number(expenseAgg._sum.amount || 0);

    const netIncome = Number((rentCollected - expenses).toFixed(2));

    return res.status(200).json({ rentCollected, outstanding, expenses, netIncome });
  } catch (e: any) {
    console.error('accounting/dashboard error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
