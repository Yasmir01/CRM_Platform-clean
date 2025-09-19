import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../../src/utils/authz';
import { prisma } from '../../_db';
import { safeParse } from '../../../src/utils/safeJson';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = String((req.query as any)?.id || '');
  if (!id) return res.status(400).json({ error: 'Missing id' });
  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    if (req.method === 'GET') {
      const owner = await prisma.owner.findUnique({ where: { id }, include: { properties: true, distributions: true } });
      if (!owner) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(owner);
    }

    if (req.method === 'PATCH') {
      const body = typeof req.body === 'string' ? safeParse(req.body, {}) : (req.body || {});
      const updates: any = {};
      if (body.name) updates.name = String(body.name);
      if (body.email) updates.email = String(body.email);
      const updated = await prisma.owner.update({ where: { id }, data: updates });
      return res.status(200).json(updated);
    }

    if (req.method === 'DELETE') {
      await prisma.owner.delete({ where: { id } });
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', 'GET, PATCH, DELETE');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e: any) {
    console.error('owners/[id] error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
