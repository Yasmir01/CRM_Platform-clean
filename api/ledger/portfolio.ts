import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const auth = getUserOr401(req, res);
  if (!auth) return;

  const ownerId = String((req.query?.ownerId as string) || '');
  if (!ownerId) return res.status(400).json({ error: 'ownerId required' });

  const meId = String((auth as any).sub || (auth as any).id);
  const me = await prisma.user.findUnique({ where: { id: meId } });
  if (!me) return res.status(401).json({ error: 'unauthorized' });

  const isSuper = me.role === 'SUPER_ADMIN';
  if (!isSuper && me.id !== ownerId) {
    return res.status(403).json({ error: 'forbidden' });
  }

  const properties = await prisma.property.findMany({ where: { ownerId } });

  let totalIncome = 0;
  let totalExpense = 0;
  const items: any[] = [];

  for (const prop of properties) {
    const [payments, expenses] = await Promise.all([
      prisma.ownerPayment.findMany({ where: { propertyId: prop.id } }),
      prisma.ownerExpense.findMany({ where: { propertyId: prop.id } }),
    ]);
    const income = payments.reduce((a, b) => a + (b.amount || 0), 0);
    const cost = expenses.reduce((a, b) => a + (b.amount || 0), 0);
    totalIncome += income;
    totalExpense += cost;
    items.push({ property: prop, totalIncome: income, totalExpense: cost, net: income - cost });
  }

  return res.status(200).json({ totalIncome, totalExpense, net: totalIncome - totalExpense, properties: items });
}
