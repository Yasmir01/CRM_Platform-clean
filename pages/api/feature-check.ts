import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../src/utils/authz';
import { hasFeatureAccess } from '../src/lib/feature-access';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const user = getUserOr401(req, res);
    if (!user) return; // getUserOr401 already responded

    const feature = String(req.query?.feature || '');
    if (!feature) return res.status(400).json({ error: 'feature required' });

    const allowed = await hasFeatureAccess(String(user.sub || user.id), feature);
    return res.status(200).json({ allowed });
  } catch (err: any) {
    console.error('feature-check error', err?.message || err);
    return res.status(500).json({ allowed: false });
  }
}
