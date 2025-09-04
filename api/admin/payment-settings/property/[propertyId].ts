import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../../_db';
import { ensurePermission } from '../../../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

  const propertyId = String((req.query as any)?.propertyId || '');
  if (!propertyId) return res.status(400).json({ error: 'Missing propertyId' });

  if (req.method === 'GET') {
    const s = await prisma.propertyPaymentSetting.findUnique({ where: { propertyId } });
    return res.status(200).json(s || null);
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const data: any = {};
    if (Number.isFinite(body.dueDay)) data.dueDay = Number(body.dueDay);
    if (Number.isFinite(body.gracePeriod)) data.gracePeriod = Number(body.gracePeriod);
    if (Number.isFinite(body.lateFee)) data.lateFee = Number(body.lateFee);

    const up = await prisma.propertyPaymentSetting.upsert({
      where: { propertyId },
      update: data,
      create: { propertyId, ...data },
    });
    return res.status(200).json(up);
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method Not Allowed' });
}
