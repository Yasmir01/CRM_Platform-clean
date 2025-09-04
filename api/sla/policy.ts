import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const user = getUserOr401(req, res);
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (!['ADMIN','SUPER_ADMIN'].includes(role)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const category = String(body.category || '').trim();
    const hours = Number(body.hours || 0);
    const propertyId = body.propertyId ? String(body.propertyId) : null;
    if (!category || !hours) return res.status(400).json({ error: 'Missing fields' });

    let policy;
    if (propertyId) {
      policy = await prisma.sLAConfig.upsert({
        where: { category_propertyId: { category, propertyId } },
        update: { hours },
        create: { category, hours, propertyId },
      });
    } else {
      const existing = await prisma.sLAConfig.findFirst({ where: { category, propertyId: null } });
      if (existing) {
        policy = await prisma.sLAConfig.update({ where: { id: existing.id }, data: { hours } });
      } else {
        policy = await prisma.sLAConfig.create({ data: { category, hours } });
      }
    }

    return res.status(200).json(policy);
  } catch (e: any) {
    console.error('sla policy error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
