import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_db';
import { ensurePermission } from '../src/lib/authorize';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method || 'GET';

  if (method === 'GET') {
    try {
      const items = await prisma.paymentGateway.findMany({ orderBy: { createdAt: 'desc' } });
      return res.status(200).json(items);
    } catch (e: any) {
      console.error('gateways list error', e?.message || e);
      return res.status(500).json({ error: 'failed' });
    }
  }

  // Admin/SU only for mutations
  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (!['ADMIN','SUPER_ADMIN'].includes(role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    if (method === 'POST') {
      const gateway = await prisma.paymentGateway.create({
        data: {
          name: String(body.name || ''),
          enabled: Boolean(body.enabled ?? false),
          config: (body.config ?? {}),
          propertyId: body.propertyId ? String(body.propertyId) : null,
          subscriptionPlanId: body.subscriptionPlanId ? String(body.subscriptionPlanId) : null,
          global: Boolean(body.global ?? false),
        },
      });
      return res.status(201).json(gateway);
    }

    if (method === 'PUT' || method === 'PATCH') {
      const id = (req.query?.id as string) || String(body.id || '');
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const gateway = await prisma.paymentGateway.update({
        where: { id },
        data: {
          enabled: typeof body.enabled === 'boolean' ? body.enabled : undefined,
          config: body.config ?? undefined,
        },
      });
      return res.status(200).json(gateway);
    }

    res.setHeader('Allow', 'GET,POST,PUT,PATCH');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e: any) {
    console.error('gateways mutate error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
