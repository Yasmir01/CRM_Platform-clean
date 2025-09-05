import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const user = getUserOr401(req, res);
  if (!user) return;

  const u = await prisma.user.findUnique({ where: { id: String((user as any).sub) } });
  if (!u) return res.status(401).json({ error: 'unauthorized' });

  const { provider, localType, providerAcct } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  await prisma.cOAMap.upsert({
    where: { orgId_provider_localType: { orgId: u.orgId, provider, localType }},
    update: { providerAcct },
    create: { orgId: u.orgId, provider, localType, providerAcct },
  });
  return res.status(200).json({ ok: true });
}
