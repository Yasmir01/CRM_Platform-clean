import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { getUserOr401 } from '../../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const auth = getUserOr401(req, res);
  if (!auth) return;
  const userId = String((auth as any).sub || (auth as any).id);
  const provider = String((req.query?.provider as string) || '').toLowerCase();
  if (!provider) return res.status(400).json({ error: 'provider required' });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(401).json({ error: 'unauthorized' });

  // Dev helper: allow setting tokens via query for testing
  const accessToken = (req.query?.access_token as string) || '';
  const refreshToken = (req.query?.refresh_token as string) || '';
  const realmId = (req.query?.realm_id as string) || (req.query?.tenant_id as string) || (req.query?.account_id as string) || '';

  if (accessToken) {
    await prisma.accountingIntegration.upsert({
      where: { orgId_provider: undefined as any }, // not unique composite; use find + update
      update: {},
      create: { orgId: user.orgId, provider, accessToken, refreshToken: refreshToken || null, expiresAt: null },
    }).catch(async () => {
      const existing = await prisma.accountingIntegration.findFirst({ where: { orgId: user.orgId, provider } });
      if (existing) {
        await prisma.accountingIntegration.update({ where: { id: existing.id }, data: { accessToken, refreshToken: refreshToken || null } });
      } else {
        await prisma.accountingIntegration.create({ data: { orgId: user.orgId, provider, accessToken, refreshToken: refreshToken || null } });
      }
    });
    return res.status(200).json({ ok: true, provider });
  }

  return res.status(501).json({ error: 'OAuth not configured. Supply access_token via query for testing.' });
}
