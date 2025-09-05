import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../_db';
import { ensurePermission } from '../../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

  if (req.method === 'GET') {
    const s = await prisma.globalPaymentSetting.findFirst();
    return res.status(200).json(s || { dueDay: 1, gracePeriod: 3, lateFee: 50 });
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const dueDay = Number.isFinite(body.dueDay) ? Number(body.dueDay) : undefined;
    const gracePeriod = Number.isFinite(body.gracePeriod) ? Number(body.gracePeriod) : undefined;
    const lateFee = Number.isFinite(body.lateFee) ? Number(body.lateFee) : undefined;

    const existing = await prisma.globalPaymentSetting.findFirst();
    const data: any = {};
    if (typeof dueDay === 'number') data.dueDay = dueDay;
    if (typeof gracePeriod === 'number') data.gracePeriod = gracePeriod;
    if (typeof lateFee === 'number') data.lateFee = lateFee;

    if (existing) {
      const updated = await prisma.globalPaymentSetting.update({ where: { id: existing.id }, data });
      return res.status(200).json(updated);
    } else {
      const created = await prisma.globalPaymentSetting.create({ data: { dueDay: data.dueDay ?? 1, gracePeriod: data.gracePeriod ?? 3, lateFee: data.lateFee ?? 50 } });
      return res.status(200).json(created);
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method Not Allowed' });
}
