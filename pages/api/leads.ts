import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from './_db';
import { getUserOr401 } from '../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // GET - list leads (authenticated: SUPER_ADMIN sees all, org admins/owners see only their org)
    if (req.method === 'GET') {
      const userPayload = getUserOr401(req, res);
      if (!userPayload) return; // getUserOr401 already responded

      const userId = String(userPayload.sub || userPayload.sub || userPayload?.id || '');
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!dbUser) return res.status(401).json({ error: 'Unauthorized' });

      const isSuper = String(dbUser.role || '').toUpperCase() === 'SUPER_ADMIN';

      const query = (req.query || {}) as any;
      const propertyId = query.propertyId ? String(query.propertyId) : undefined;

      const where: any = {};
      if (!isSuper) {
        // restrict to org
        where.property = { orgId: dbUser.orgId };
      }
      if (propertyId) where.propertyId = propertyId;

      const leads = await prisma.lead.findMany({
        where,
        include: { property: true },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({ leads });
    }

    // POST - create a lead (public)
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const propertyId = body.propertyId ? String(body.propertyId) : '';
      const name = body.name ? String(body.name).trim() : '';
      const email = body.email ? String(body.email).trim() : '';
      const phone = body.phone ? String(body.phone).trim() : null;
      const message = body.message ? String(body.message).trim() : null;
      const source = body.source ? String(body.source) : null;

      if (!propertyId || !name || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const lead = await prisma.lead.create({
        data: {
          propertyId,
          name,
          email,
          phone: phone || undefined,
          message: message || undefined,
          source: source || undefined,
        },
      });

      return res.status(201).json({ success: true, lead });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('lead handler error', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
}
