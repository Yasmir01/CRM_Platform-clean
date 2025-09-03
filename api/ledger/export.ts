import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../api/_db';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  const auth = getUserOr401(req, res);
  if (!auth) return;
  const userId = String((auth as any).sub || (auth as any).id);

  const propertyId = String((req.query?.propertyId as string) || '');
  if (!propertyId) return res.status(400).json({ error: 'propertyId required' });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ error: 'unauthorized' });

  const isSuper = user.role === 'SUPER_ADMIN';
  const isOrgAdmin = ['ADMIN','MANAGER'].includes(user.role as any);
  const isOwner = user.role === 'OWNER';

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) return res.status(404).json({ error: 'property not found' });

  if (!isSuper) {
    if (isOwner) {
      if (property.ownerId && property.ownerId !== user.id) return res.status(403).json({ error: 'forbidden' });
    } else if (isOrgAdmin) {
      if (property.orgId && property.orgId !== user.orgId) return res.status(403).json({ error: 'forbidden' });
    } else {
      return res.status(403).json({ error: 'forbidden' });
    }
  }

  const payments = await prisma.ownerPayment.findMany({ where: { propertyId }, orderBy: { date: 'asc' } });
  const expenses = await prisma.ownerExpense.findMany({ where: { propertyId }, orderBy: { date: 'asc' } });

  const header = 'Type,Category,Amount,Date\n';
  const esc = (s: string) => '"' + s.replace(/"/g, '""') + '"';
  const rowsIncome = payments.map((p) => ['Income', esc(p.type), p.amount.toFixed(2), new Date(p.date).toISOString()].join(',')).join('\n');
  const rowsExpense = expenses.map((e) => ['Expense', esc(e.category), e.amount.toFixed(2), new Date(e.date).toISOString()].join(',')).join('\n');
  const csv = header + [rowsIncome, rowsExpense].filter(Boolean).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=owner_ledger.csv');
  return res.status(200).send(csv);
}
