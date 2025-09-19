import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../src/utils/authz';
import { prisma } from '../_db';
import { safeParse } from '../../src/utils/safeJson';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    if (req.method === 'GET') {
      const q = (req.query || {}) as any;
      const propertyId = q.propertyId ? String(q.propertyId) : undefined;
      const where: any = {};
      if (propertyId) where.propertyId = propertyId;
      const events = await prisma.calendarEvent.findMany({ where, orderBy: { dueDate: 'asc' } });
      return res.status(200).json(events);
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? safeParse(req.body, {}) : (req.body || {});
      const title = String(body.title || '').trim();
      const description = body.description ? String(body.description) : undefined;
      const category = body.category ? String(body.category) : undefined;
      const dueDate = body.dueDate ? new Date(body.dueDate) : null;
      const propertyId = body.propertyId ? String(body.propertyId) : undefined;
      const userId = body.userId ? String(body.userId) : undefined;

      if (!title || !dueDate) return res.status(400).json({ error: 'Missing fields' });

      const ev = await prisma.calendarEvent.create({ data: { title, description, category, dueDate, propertyId: propertyId || undefined, userId: userId || undefined } });
      return res.status(200).json(ev);
    }

    if (req.method === 'DELETE') {
      const q = (req.query || {}) as any;
      const id = String(q.id || '');
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await prisma.calendarEvent.delete({ where: { id } });
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e: any) {
    console.error('calendar/events error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
