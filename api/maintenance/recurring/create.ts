import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../../api/_db';
import { getUserOr401 } from '../../../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');
  const user = getUserOr401(req, res);
  if (!user) return;

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const { propertyId, unitId, title, description, frequency, interval = 1, vendorId, firstRunAt } = body as any;

  if (!propertyId || typeof propertyId !== 'string') return res.status(400).json({ error: 'propertyId required' });
  if (!title || typeof title !== 'string' || title.length < 2) return res.status(400).json({ error: 'title too short' });
  const freq = String(frequency || 'MONTH').toUpperCase();
  if (!['DAY','WEEK','MONTH','QUARTER','YEAR'].includes(freq)) return res.status(400).json({ error: 'invalid frequency' });
  const iv = Number(interval);
  if (!Number.isInteger(iv) || iv <= 0) return res.status(400).json({ error: 'invalid interval' });

  const nextRunAt = firstRunAt ? new Date(firstRunAt) : new Date();

  const task = await prisma.recurringTask.create({
    data: {
      propertyId,
      unitId: unitId || null,
      title,
      description: description || null,
      frequency: freq as any,
      interval: iv,
      nextRunAt,
      vendorId: vendorId || null,
    },
  });

  return res.status(200).json({ ok: true, task });
}
