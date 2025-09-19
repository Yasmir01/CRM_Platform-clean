import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../../../src/utils/authz';
import { prisma } from '../../../_db';
import { safeParse } from '../../../../src/utils/safeJson';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = String((req.query as any)?.id || '');
  if (!id) return res.status(400).json({ error: 'Missing id' });
  const user = getUserOr401(req, res);
  if (!user) return;
  if (!String((user as any).role || '').toLowerCase().includes('super')) return res.status(403).json({ error: 'forbidden' });

  try {
    if (req.method === 'GET') {
      const r = await prisma.role.findUnique({ where: { id } });
      if (!r) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(r);
    }

    if (req.method === 'PATCH') {
      const body = typeof req.body === 'string' ? safeParse(req.body, {}) : (req.body || {});
      const updates: any = {};
      if (body.name) updates.name = String(body.name);
      if (body.permissions) updates.permissions = body.permissions;
      const updated = await prisma.role.update({ where: { id }, data: updates });
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      await prisma.role.delete({ where: { id } });
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', 'GET, PATCH, DELETE');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e: any) {
    console.error('admin/roles/[id] error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
