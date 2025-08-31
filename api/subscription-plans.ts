import { BillingCycle } from '@prisma/client';
import { prisma } from './_db';

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const plans = await prisma.subscriptionPlan.findMany({ orderBy: { createdAt: 'desc' } });
      return res.status(200).json(plans);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const plan = await prisma.subscriptionPlan.create({
        data: {
          name: body.name,
          price: Number(body.price || 0),
          billingCycle: (body.billingCycle || 'monthly') as BillingCycle,
          description: body.description || null,
          userLimit: Number(body.userLimit || 1),
          propertyLimit: Number(body.propertyLimit || 10),
          isActive: body.isActive !== false,
          features: Array.isArray(body.features) ? body.features : [],
          pages: Array.isArray(body.pages) ? body.pages : [],
          tools: Array.isArray(body.tools) ? body.tools : [],
          services: Array.isArray(body.services) ? body.services : [],
        },
      });
      return res.status(201).json(plan);
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const q = (req && req.query) || {};
      const id = (q.id as string) || (req.body && (req.body as any).id);
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const updated = await prisma.subscriptionPlan.update({
        where: { id },
        data: {
          name: body.name,
          price: body.price !== undefined ? Number(body.price) : undefined,
          billingCycle: (body.billingCycle as BillingCycle | undefined),
          description: body.description ?? undefined,
          userLimit: body.userLimit !== undefined ? Number(body.userLimit) : undefined,
          propertyLimit: body.propertyLimit !== undefined ? Number(body.propertyLimit) : undefined,
          isActive: typeof body.isActive === 'boolean' ? body.isActive : undefined,
          features: Array.isArray(body.features) ? body.features : undefined,
          pages: Array.isArray(body.pages) ? body.pages : undefined,
          tools: Array.isArray(body.tools) ? body.tools : undefined,
          services: Array.isArray(body.services) ? body.services : undefined,
        },
      });
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      const q = (req && req.query) || {};
      const id = q.id as string;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await prisma.subscriptionPlan.delete({ where: { id } });
      return res.status(204).end();
    }

    if (res && typeof res.setHeader === 'function') {
      res.setHeader('Allow', 'GET,POST,PUT,PATCH,DELETE');
    }
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error: any) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error?.message });
  }
}
