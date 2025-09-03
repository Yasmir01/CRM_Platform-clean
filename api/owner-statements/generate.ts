import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { isAuthorizedAdmin } from '../_auth';
import { sendMail } from '../../src/lib/mailer';

function prevMonthRange(ref = new Date()) {
  const start = new Date(ref);
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCMonth(start.getUTCMonth() - 1);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);
  return { start, end };
}

function csvEscape(s: string) {
  const str = (s || '').replace(/"/g, '""');
  return `"${str}"`;
}

function slugify(s: string) {
  return (s || 'property').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const isCron = Boolean((req.headers['x-vercel-cron'] as string) || (req.headers['X-Vercel-Cron'] as any));
  if (!isCron && !isAuthorizedAdmin(req)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const owners = await prisma.user.findMany({ where: { role: 'OWNER' as any }, select: { id: true, email: true, name: true, orgId: true } });
    const { start, end } = prevMonthRange();
    let sent = 0;

    for (const owner of owners) {
      if (!owner.email) continue;
      const properties = await prisma.property.findMany({ where: { ownerId: owner.id } });
      for (const property of properties) {
        const payments = await prisma.ownerPayment.findMany({ where: { propertyId: property.id, date: { gte: start, lt: end } } });
        const expenses = await prisma.ownerExpense.findMany({ where: { propertyId: property.id, date: { gte: start, lt: end } } });

        const totalIncome = payments.reduce((a, b) => a + (b.amount || 0), 0);
        const totalExpense = expenses.reduce((a, b) => a + (b.amount || 0), 0);
        const net = totalIncome - totalExpense;

        const header = 'Owner Statement' + '\n';
        const lines: string[] = [];
        lines.push(`Period,${start.toISOString()} - ${end.toISOString()}`);
        lines.push(`Property,${csvEscape(property.address || property.id)}`);
        lines.push(`Income,${totalIncome.toFixed(2)}`);
        lines.push(`Expenses,${totalExpense.toFixed(2)}`);
        lines.push(`Net,${net.toFixed(2)}`);
        lines.push('');
        lines.push('Type,Category/Type,Amount,Date');
        for (const p of payments) lines.push(['Income', csvEscape(p.type), p.amount.toFixed(2), new Date(p.date).toISOString()].join(','));
        for (const e of expenses) lines.push(['Expense', csvEscape(e.category), e.amount.toFixed(2), new Date(e.date).toISOString()].join(','));
        const csv = header + lines.join('\n');

        await sendMail([owner.email], `Monthly Owner Statement - ${property.address || property.id}`, 'Attached is your monthly statement.', [
          { filename: `OwnerStatement-${slugify(property.address || property.id)}.csv`, content: csv },
        ]);
        sent += 1;
      }
    }

    return res.status(200).json({ ok: true, sent });
  } catch (e: any) {
    console.error('owner statements error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
