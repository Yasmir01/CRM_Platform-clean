import { prisma } from '../_db';
import { ensurePermission } from '../../src/lib/authorize';

export default async function handler(req: any, res: any) {
  const method = req.method || 'GET';

  if (method === 'GET') {
    try {
      const { propertyId } = req.query as { propertyId?: string };
      let policy = null as any;
      if (propertyId) {
        policy = await prisma.propertyPaymentPolicy.findUnique({ where: { propertyId } });
      } else {
        policy = await prisma.propertyPaymentPolicy.findFirst({ where: { propertyId: null } });
      }
      return res.status(200).json(policy);
    } catch (e: any) {
      console.error('payment-policies GET error', e?.message || e);
      return res.status(500).json({ error: 'failed' });
    }
  }

  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) return res.status(403).json({ error: 'Forbidden' });

  if (method === 'PUT') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const data = {
        allowPartial: Boolean(body.allowPartial ?? true),
        allowSplit: Boolean(body.allowSplit ?? true),
        minPartialUsd: Number(body.minPartialUsd ?? 10),
      };

      let result;
      if (body.propertyId) {
        result = await prisma.propertyPaymentPolicy.upsert({
          where: { propertyId: String(body.propertyId) },
          update: data,
          create: { ...data, propertyId: String(body.propertyId) },
        });
      } else {
        const existing = await prisma.propertyPaymentPolicy.findFirst({ where: { propertyId: null } });
        if (existing) {
          result = await prisma.propertyPaymentPolicy.update({ where: { id: existing.id }, data });
        } else {
          result = await prisma.propertyPaymentPolicy.create({ data: { ...data, propertyId: null } });
        }
      }

      return res.status(200).json(result);
    } catch (e: any) {
      console.error('payment-policies PUT error', e?.message || e);
      return res.status(500).json({ error: 'failed' });
    }
  }

  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).json({ error: 'Method Not Allowed' });
}
