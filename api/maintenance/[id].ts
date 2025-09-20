import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const user = getUserOr401(req, res);
    if (!user) return;

    const id = String((req.query as any)?.id || '');
    if (!id) return res.status(400).json({ error: 'Missing id' });

    if (req.method === 'GET') {
      const reqItem = await prisma.maintenanceRequest.findUnique({ where: { id } });
      return res.status(200).json(reqItem);
    }

    if (req.method === 'PATCH') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const updated = await prisma.maintenanceRequest.update({ where: { id }, data: { status: String(body.status || '') } });
      return res.status(200).json(updated);
    }

    res.setHeader('Allow', 'GET, PATCH');
    return res.status(405).end();
  } catch (e: any) {
    console.error('maintenance [id] handler error', e?.message || e);
    return res.status(500).json({ error: 'Server error' });
  }
}
