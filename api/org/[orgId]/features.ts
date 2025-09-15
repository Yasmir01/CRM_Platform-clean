import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { getUserOr401 } from '../../src/utils/authz';

const ALLOWED_FEATURES = new Set([
  'exportEnabled',
  'remindersEnabled',
  'brandingEnabled',
  'historyEnabled',
  'leadsEnabled',
]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { orgId } = req.query as any;
  if (!orgId) return res.status(400).json({ error: 'Missing orgId' });

  if (req.method === 'GET') {
    try {
      const org = await prisma.organization.findUnique({
        where: { id: String(orgId) },
        select: {
          exportEnabled: true,
          remindersEnabled: true,
          brandingEnabled: true,
          historyEnabled: true,
          leadsEnabled: true,
          planTier: true,
        },
      });
      return res.status(200).json(org);
    } catch (e: any) {
      console.error('org features GET error', e?.message || e);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  if (req.method === 'PATCH') {
    const user = getUserOr401(req, res);
    if (!user) return;

    // only SUPER_ADMIN may patch org feature flags
    const userId = String((user as any).sub || (user as any).id || '');
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser) return res.status(401).json({ error: 'Unauthorized' });
    if (String(dbUser.role || '').toUpperCase() !== 'SUPER_ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const feature = String(body.feature || '');
    const enabled = body.enabled;

    if (!ALLOWED_FEATURES.has(feature)) {
      return res.status(400).json({ error: 'Invalid feature' });
    }
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'Missing enabled boolean' });
    }

    try {
      const updated = await prisma.organization.update({
        where: { id: String(orgId) },
        data: { [feature]: enabled } as any,
      });
      return res.status(200).json(updated);
    } catch (e: any) {
      console.error('org features PATCH error', e?.message || e);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  res.setHeader('Allow', 'GET, PATCH');
  return res.status(405).end();
}
