import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';
import { syncLedger } from '../../src/lib/accounting';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const auth = getUserOr401(req, res);
  if (!auth) return;
  const userId = String((auth as any).sub || (auth as any).id);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ error: 'unauthorized' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const propertyId = String(body.propertyId || '');
  if (!propertyId) return res.status(400).json({ error: 'propertyId required' });

  const integ = await prisma.accountingIntegration.findFirst({ where: { orgId: user.orgId } });
  if (!integ) return res.status(400).json({ error: 'No accounting provider connected' });

  const payments = await prisma.ownerPayment.findMany({ where: { propertyId } });
  const expenses = await prisma.ownerExpense.findMany({ where: { propertyId } });
  const ledger = {
    payments: payments.map((p) => ({ amount: p.amount, date: new Date(p.date).toISOString().slice(0, 10), type: p.type })),
    expenses: expenses.map((e) => ({ amount: e.amount, date: new Date(e.date).toISOString().slice(0, 10), category: e.category, description: e.description })),
  };

  const creds: any = { accessToken: integ.accessToken };
  // Allow passing realm/tenant/account IDs in a separate table or env; here accept optional query overrides
  const realmId = (req.query?.realm_id as string) || '';
  const tenantId = (req.query?.tenant_id as string) || '';
  const accountId = (req.query?.account_id as string) || '';
  if (realmId) creds.realmId = realmId;
  if (tenantId) creds.tenantId = tenantId;
  if (accountId) creds.accountId = accountId;

  try {
    const result = await syncLedger(integ.provider, creds, ledger);
    return res.status(200).json({ ok: true, result });
  } catch (e: any) {
    console.error('sync error', e?.message || e);
    return res.status(500).json({ error: 'sync failed', message: e?.message || String(e) });
  }
}
