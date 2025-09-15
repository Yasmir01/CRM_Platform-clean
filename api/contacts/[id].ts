import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensurePermission } from '../../src/lib/authorize';
import { getUserOr401 } from '../../src/utils/authz';
import { prisma } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = String(req.query.id || '');
  if (!id) return res.status(400).json({ error: 'Missing id' });

  try {
    if (req.method === 'GET') {
      const user = getUserOr401(req, res);
      if (!user) return;
      const contact = await prisma.contact.findUnique({ where: { id }, include: { company: true, notes: { orderBy: { createdAt: 'desc' } } } });
      if (!contact) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(contact);
    }

    if (req.method === 'PATCH') {
      const user = ensurePermission(req, res, 'contacts:manage');
      if (!user) return;
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const data: any = {};
      if (body.firstName !== undefined) data.firstName = body.firstName;
      if (body.lastName !== undefined) data.lastName = body.lastName;
      if (body.email !== undefined) data.email = body.email;
      if (body.phone !== undefined) data.phone = body.phone;
      if (body.position !== undefined) data.position = body.position;
      if (body.companyId !== undefined) data.companyId = body.companyId;
      if (body.ownerId !== undefined) data.ownerId = body.ownerId;

      const updated = await prisma.contact.update({ where: { id }, data });
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      const user = ensurePermission(req, res, 'contacts:manage');
      if (!user) return;
      // soft delete
      const archived = await prisma.contact.update({ where: { id }, data: { archived: true } });
      return res.status(200).json({ ok: true, archived });
    }

    res.setHeader('Allow', 'GET, PATCH, DELETE');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e: any) {
    console.error('contacts/[id] handler error', e?.message || e);
    return res.status(500).json({ error: 'Server error' });
  }
}
