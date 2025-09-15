import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = getUserOr401(req, res);
  if (!user) return;

  const orgId = String((user as any).orgId || '');
  if (!orgId) return res.status(400).json({ error: 'Missing orgId' });

  try {
    const settings = await prisma.orgSettings.findUnique({ where: { orgId } });
    return res.status(200).json(settings || null);
  } catch (e: any) {
    console.error('org-settings current error', e?.message || e);
    return res.status(500).json({ error: 'Server error' });
  }
}
