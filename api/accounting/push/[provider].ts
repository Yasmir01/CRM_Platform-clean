import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../../../src/utils/authz';
import { prisma } from '../../../_db';
import { ensureValidToken } from '../../../../src/lib/accounting/ensureToken';
import { getProvider } from '../../../../src/lib/accounting/factory';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const user = getUserOr401(req, res);
  if (!user) return;
  const u = await prisma.user.findUnique({ where: { id: String((user as any).sub) } });
  if (!u) return res.status(401).json({ error: 'unauthorized' });

  const providerName = String((req.query as any).provider || '');
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  try {
    const map = await prisma.cOAMap.findUnique({
      where: { orgId_provider_localType: { orgId: u.orgId, provider: providerName, localType: body.localType } },
    });
    if (!map) return res.status(400).json({ error: 'No COA mapping for this entry type' });

    const tokens = await ensureValidToken(u.orgId, providerName as any);
    const provider = getProvider(providerName as any);
    const result = await provider.pushLedgerEntry(tokens, {
      orgId: u.orgId,
      entryType: body.entryType,
      amount: Number(body.amount || 0),
      date: String(body.date || new Date().toISOString()),
      memo: body.memo,
      accountId: map.providerAcct,
    });

    await prisma.accountingSyncLog.create({
      data: { orgId: u.orgId, provider: providerName, direction: 'push', entity: 'ledger_entry', payload: body, status: 'success', message: result.externalId },
    });

    return res.status(200).json({ ok: true, externalId: result.externalId });
  } catch (e: any) {
    await prisma.accountingSyncLog.create({
      data: { orgId: u.orgId, provider: providerName, direction: 'push', entity: 'ledger_entry', payload: body, status: 'failed', message: e?.message || 'error' },
    });
    return res.status(400).json({ error: e?.message || 'Failed to push entry' });
  }
}
