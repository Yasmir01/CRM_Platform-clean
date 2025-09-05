import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../../../src/utils/authz';
import { prisma } from '../../../_db';
import { ensureValidToken } from '../../../../src/lib/accounting/ensureToken';
import { getProvider } from '../../../../src/lib/accounting/factory';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
  const user = getUserOr401(req, res);
  if (!user) return;
  const u = await prisma.user.findUnique({ where: { id: String((user as any).sub) } });
  if (!u) return res.status(401).json({ error: 'unauthorized' });

  const providerName = String((req.query as any).provider || '');
  try {
    const tokens = await ensureValidToken(u.orgId, providerName as any);
    const provider = getProvider(providerName as any);
    const accounts = await provider.listAccounts(tokens);
    return res.status(200).json(accounts);
  } catch (e: any) {
    return res.status(400).json({ error: e?.message || 'Failed to list accounts' });
  }
}
