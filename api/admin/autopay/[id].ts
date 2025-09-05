import { prisma } from '../../_db';
import { ensurePermission } from '../../../src/lib/authorize';
import { prisma } from '../../_db';

export default async function handler(req: any, res: any) {
  const method = req.method || 'GET';
  if (!['PATCH','DELETE'].includes(method)) {
    res.setHeader('Allow', 'PATCH, DELETE');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (!['ADMIN','SUPER_ADMIN'].includes(role)) return res.status(403).json({ error: 'Forbidden' });

  try {
    const { id } = req.query as { id?: string };
    if (!id) return res.status(400).json({ error: 'Missing id' });

    if (method === 'PATCH') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const data: any = {};
      if (typeof body.active === 'boolean') data.active = Boolean(body.active);
      if (typeof body.dayOfMonth === 'number') data.dayOfMonth = Number(body.dayOfMonth);
      if (typeof body.frequency === 'string') data.frequency = String(body.frequency);
      if (Array.isArray(body.splitEmails)) data.splitEmails = body.splitEmails.map(String);
      const updated = await prisma.autoPay.update({ where: { id: String(id) }, data });
      return res.status(200).json(updated);
    }

    if (method === 'DELETE') {
      await prisma.autoPay.delete({ where: { id: String(id) } });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e: any) {
    console.error('admin/autopay/[id] error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
