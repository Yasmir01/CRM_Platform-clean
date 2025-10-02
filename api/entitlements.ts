import { prisma } from './_db';
import { requireAdminOr403 } from './_auth';

export default async function handler(req: any, res: any) {
  try {
    const q = (req && req.query) || {};
    const planId = (q.planId as string) || (req.body && (typeof req.body === 'string' ? JSON.parse(req.body) : req.body).planId);
    if (!planId) return res.status(400).json({ error: 'Missing planId' });

    if (req.method === 'GET') {
      const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
      if (!plan) return res.status(404).json({ error: 'Plan not found' });
      const { pages, tools, services, paymentTypes, backupTypes } = plan as any;
      return res.status(200).json({ pages, tools, services, paymentTypes, backupTypes });
    }

    if (req.method === 'PUT' || req.method === 'PATCH' || req.method === 'POST') {
      if (!requireAdminOr403(req, res)) return;
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const updated = await prisma.subscriptionPlan.update({
        where: { id: planId },
        data: {
          pages: Array.isArray(body.pages) ? body.pages : undefined,
          tools: Array.isArray(body.tools) ? body.tools : undefined,
          services: Array.isArray(body.services) ? body.services : undefined,
          paymentTypes: Array.isArray(body.paymentTypes) ? body.paymentTypes : undefined,
          backupTypes: Array.isArray(body.backupTypes) ? body.backupTypes : undefined,
        },
      });
      const { pages, tools, services, paymentTypes, backupTypes } = updated as any;
      return res.status(200).json({ pages, tools, services, paymentTypes, backupTypes });
    }

    res.setHeader('Allow', 'GET,POST,PUT,PATCH');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error: any) {
    console.error('Entitlements API error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error?.message });
  }
}
