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
    const level = Number(body.level);
    const hoursAfterDeadline = Number(body.hoursAfterDeadline);
    const roleStr = String(body.role || '').toUpperCase();
    const propertyId = body.propertyId ? String(body.propertyId) : null;
    const subscriptionPlanId = body.subscriptionPlanId ? String(body.subscriptionPlanId) : null;

    if (!level || !roleStr || Number.isNaN(hoursAfterDeadline)) return res.status(400).json({ error: 'Missing fields' });
    if (propertyId && subscriptionPlanId) return res.status(400).json({ error: 'Specify only one scope' });

    const item = await prisma.escalationMatrix.upsert({
      where: { level_propertyId_subscriptionPlanId: { level, propertyId, subscriptionPlanId } },
      update: { role: roleStr, hoursAfterDeadline },
      create: { level, role: roleStr, hoursAfterDeadline, propertyId, subscriptionPlanId },
    });

    return res.status(200).json(item);
  } catch (e: any) {
    console.error('escalation-matrix upsert error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
