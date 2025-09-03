import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { getUserOr401 } from '../../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  const auth = getUserOr401(req, res);
  if (!auth) return;

  const ownerId = String((req.query?.ownerId as string) || '');
  if (!ownerId) return res.status(400).json({ error: 'ownerId required' });

  const meId = String((auth as any).sub || (auth as any).id);
  const me = await prisma.user.findUnique({ where: { id: meId } });
  if (!me) return res.status(401).json({ error: 'unauthorized' });
  const isSuper = me.role === 'SUPER_ADMIN';
  if (!isSuper && me.id !== ownerId) return res.status(403).json({ error: 'forbidden' });

  const properties = await prisma.property.findMany({ where: { ownerId } });

  const esc = (s: string) => '"' + (s || '').replace(/"/g, '""') + '"';
  let csv = 'Property,Income,Expenses,Net\n';

  for (const prop of properties) {
    const [payments, expenses] = await Promise.all([
      prisma.ownerPayment.findMany({ where: { propertyId: prop.id } }),
      prisma.ownerExpense.findMany({ where: { propertyId: prop.id } }),
    ]);
    const income = payments.reduce((a, b) => a + (b.amount || 0), 0);
    const cost = expenses.reduce((a, b) => a + (b.amount || 0), 0);
    const net = income - cost;
    csv += `${esc(prop.address || prop.id)},${income},${cost},${net}\n`;
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=portfolio_ledger.csv');
  return res.status(200).send(csv);
}
