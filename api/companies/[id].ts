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
      const company = await prisma.company.findUnique({ where: { id }, include: { contacts: { where: { archived: false } } } });
      if (!company) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(company);
    }

    if (req.method === 'PATCH') {
      const user = ensurePermission(req, res, 'companies:manage');
      if (!user) return;
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const data: any = {};
      if (body.name !== undefined) data.name = body.name;
      if (body.domain !== undefined) data.domain = body.domain;
      if (body.industry !== undefined) data.industry = body.industry;
      if (body.size !== undefined) data.size = body.size;

      const updated = await prisma.company.update({ where: { id }, data });
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      const user = ensurePermission(req, res, 'companies:manage');
      if (!user) return;
      // soft delete
      const archived = await prisma.company.update({ where: { id }, data: { archived: true } });
      return res.status(200).json({ ok: true, archived });
    }

    res.setHeader('Allow', 'GET, PATCH, DELETE');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e: any) {
    console.error('companies/[id] handler error', e?.message || e);
    return res.status(500).json({ error: 'Server error' });
  }
}
