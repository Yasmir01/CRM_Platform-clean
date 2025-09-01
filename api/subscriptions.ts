import { SubscriptionStatus } from '@prisma/client';
import { prisma } from './_db';
import { requireAdminOr403 } from './_auth';

export default async function handler(req: any, res: any) {
  try {
    if (req.method === 'GET') {
      const items = await prisma.subscription.findMany({ include: { subscriber: true, plan: true }, orderBy: { createdAt: 'desc' } });
      return res.status(200).json(items);
    }

    if (req.method === 'POST') {
      if (!requireAdminOr403(req, res)) return;
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const item = await prisma.subscription.create({
        data: {
          subscriberId: body.subscriberId,
          planId: body.planId || null,
          status: (body.status || 'active') as SubscriptionStatus,
          startDate: body.startDate ? new Date(body.startDate) : undefined,
          endDate: body.endDate ? new Date(body.endDate) : undefined,
          stripeCustomerId: body.stripeCustomerId || null,
          stripeSubscriptionId: body.stripeSubscriptionId || null,
          cancelAtPeriodEnd: !!body.cancelAtPeriodEnd,
        },
        include: { subscriber: true, plan: true }
      });
      return res.status(201).json(item);
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      if (!requireAdminOr403(req, res)) return;
      const id = (req.query.id as string) || (req.body && (req.body as any).id);
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const updated = await prisma.subscription.update({
        where: { id },
        data: {
          subscriberId: body.subscriberId,
          planId: body.planId ?? undefined,
          status: body.status as SubscriptionStatus | undefined,
          startDate: body.startDate ? new Date(body.startDate) : undefined,
          endDate: body.endDate ? new Date(body.endDate) : undefined,
          stripeCustomerId: body.stripeCustomerId ?? undefined,
          stripeSubscriptionId: body.stripeSubscriptionId ?? undefined,
          cancelAtPeriodEnd: typeof body.cancelAtPeriodEnd === 'boolean' ? body.cancelAtPeriodEnd : undefined,
        },
        include: { subscriber: true, plan: true }
      });
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      if (!requireAdminOr403(req, res)) return;
      const id = req.query.id as string;
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await prisma.subscription.delete({ where: { id } });
      return res.status(204).end();
    }

    res.setHeader('Allow', 'GET,POST,PUT,PATCH,DELETE');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error: any) {
    console.error('Subscriptions API error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error?.message });
  }
}
