import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { ensurePermission } from '../../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const user = ensurePermission(req, res, 'payments:read');
    if (!user) return;
    const tenantId = String((user as any).sub || (user as any).id);
    try {
      const ap = await prisma.autoPay.findUnique({ where: { tenantId } });
      return res.status(200).json(ap);
    } catch (e: any) {
      console.error('autopay get error', e?.message || e);
      return res.status(500).json({ error: 'failed' });
    }
  }

  if (req.method === 'POST') {
    const user = ensurePermission(req, res, 'payments:create');
    if (!user) return;
    const tenantId = String((user as any).sub || (user as any).id);

    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const amount = Number(body.amount);
      const dayOfMonth = Number(body.dayOfMonth);
      const frequency = String(body.frequency || 'monthly');
      if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
        return res.status(400).json({ error: 'invalid fields' });
      }

      const autopay = await prisma.autoPay.upsert({
        where: { tenantId },
        update: { amount, dayOfMonth, frequency, active: true },
        create: { tenantId, amount, dayOfMonth, frequency, active: true },
      });

      await prisma.user.update({ where: { id: tenantId }, data: { autopayEnabled: true } });

      return res.status(200).json(autopay);
    } catch (e: any) {
      console.error('autopay upsert error', e?.message || e);
      return res.status(500).json({ error: 'failed' });
    }
  }

  if (req.method === 'DELETE') {
    const user = ensurePermission(req, res, 'payments:create');
    if (!user) return;
    const tenantId = String((user as any).sub || (user as any).id);

    try {
      await prisma.autoPay.updateMany({ where: { tenantId }, data: { active: false } });
      await prisma.user.update({ where: { id: tenantId }, data: { autopayEnabled: false } });
      return res.status(200).json({ ok: true });
    } catch (e: any) {
      console.error('autopay deactivate error', e?.message || e);
      return res.status(500).json({ error: 'failed' });
    }
  }

  res.setHeader('Allow', 'GET, POST, DELETE');
  return res.status(405).json({ error: 'Method Not Allowed' });
}
