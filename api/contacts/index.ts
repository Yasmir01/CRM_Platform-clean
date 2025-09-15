import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../src/utils/authz';
import { ensurePermission } from '../../src/lib/authorize';
import { prisma } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const user = getUserOr401(req, res);
      if (!user) return;

      const q = String((req.query as any).q || '').trim();
      const companyId = String((req.query as any).companyId || '');
      const ownerId = String((req.query as any).ownerId || '');
      const take = Math.min(1000, Number((req.query as any).take || 50));
      const skip = Math.max(0, Number((req.query as any).skip || 0));

      const where: any = { archived: false };
      if (companyId) where.companyId = companyId;
      if (ownerId) where.ownerId = ownerId;
      if (q) {
        const qLower = q.toLowerCase();
        where.OR = [
          { firstName: { contains: qLower, mode: 'insensitive' } },
          { lastName: { contains: qLower, mode: 'insensitive' } },
          { email: { contains: qLower, mode: 'insensitive' } },
          { phone: { contains: qLower, mode: 'insensitive' } },
        ];
      }

      const contacts = await prisma.contact.findMany({ where, take, skip, orderBy: { updatedAt: 'desc' }, include: { company: true } });
      return res.status(200).json(contacts);
    }

    if (req.method === 'POST') {
      const user = ensurePermission(req, res, 'contacts:manage');
      if (!user) return;

      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const data: any = {
        firstName: String(body.firstName || '').trim(),
        lastName: String(body.lastName || '').trim(),
        email: body.email || null,
        phone: body.phone || null,
        position: body.position || null,
        companyId: body.companyId || null,
        ownerId: body.ownerId || null,
      };
      if (!data.firstName || !data.lastName) return res.status(400).json({ error: 'Missing name' });

      const created = await prisma.contact.create({ data });
      return res.status(201).json(created);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e: any) {
    console.error('contacts handler error', e?.message || e);
    return res.status(500).json({ error: 'Server error' });
  }
}
