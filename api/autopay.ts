import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_db';
import { ensurePermission } from '../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const user = ensurePermission(req, res, 'payments:create');
    if (!user) return;
    const tenantId = String((user as any).sub || (user as any).id);

    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const data = {
        tenantId,
        propertyId: body.propertyId ? String(body.propertyId) : null,
        gatewayId: body.gatewayId ? String(body.gatewayId) : null,
        methodId: body.methodId ? String(body.methodId) : null,
        amountType: body.amountType ? String(body.amountType) : 'FULL_RENT',
        amountValue: body.amountValue !== undefined ? Number(body.amountValue) : null,
        dayOfMonth: Number(body.dayOfMonth || 1),
        active: true,
      } as any;

      if (!Number.isInteger(data.dayOfMonth) || data.dayOfMonth < 1 || data.dayOfMonth > 31) {
        return res.status(400).json({ error: 'Invalid dayOfMonth' });
      }

      const ap = await prisma.autoPay.upsert({
        where: { tenantId },
        update: data,
        create: { ...data, amount: 0, frequency: 'monthly' },
      });

      return res.status(200).json(ap);
    } catch (e: any) {
      console.error('autopay save error', e?.message || e);
      return res.status(500).json({ error: 'failed' });
    }
  }

  if (req.method === 'GET') {
    const user = ensurePermission(req, res, 'payments:read');
    if (!user) return;
    const tenantId = String((user as any).sub || (user as any).id);
    try {
      const items = await prisma.autoPay.findMany({ where: { tenantId } });
      return res.status(200).json(items);
    } catch (e: any) {
      console.error('autopay list error', e?.message || e);
      return res.status(500).json({ error: 'failed' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method Not Allowed' });
}
