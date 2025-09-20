import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const user = getUserOr401(req, res);
    if (!user) return;

    if (req.method === 'GET') {
      const take = Math.min(1000, Number((req.query as any).take || 100));
      const items = await prisma.maintenanceRequest.findMany({ orderBy: { createdAt: 'desc' }, take });
      return res.status(200).json(items);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const newReq = await prisma.maintenanceRequest.create({
        data: {
          tenantId: String(user.sub || user.id || ''),
          propertyId: body.propertyId || null,
          subject: String(body.subject || '').slice(0, 255),
          description: String(body.description || ''),
          status: 'open',
        },
      });
      return res.status(201).json(newReq);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).end();
  } catch (e: any) {
    console.error('maintenance handler error', e?.message || e);
    return res.status(500).json({ error: 'Server error' });
  }
}
