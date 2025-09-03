import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');
  const ownerId = (req.query.ownerId as string) || '';
  const month = Number(req.query.month || new Date().getMonth() + 1);
  const year = Number(req.query.year || new Date().getFullYear());

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  try {
    // If you have ledger/payment/expense models, compute here. Fallback to zeroes.
    const totalIncome = 0;
    const totalExpenses = 0;
    const net = totalIncome - totalExpenses;

    return res.status(200).json({ month, year, totalIncome, totalExpenses, net, income: [], expenses: [], ownerId });
  } catch (e: any) {
    console.error('owner-statement error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
