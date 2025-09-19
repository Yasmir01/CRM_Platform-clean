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
      const lease = await prisma.lease.findUnique({ where: { id } });
      if (!lease) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(lease);
    }

    if (req.method === 'PATCH') {
      const body = typeof req.body === 'string' ? safeParse(req.body, {}) : (req.body || {});
      const updates: any = {};
      if (body.endDate) updates.endDate = new Date(body.endDate);
      if (body.startDate) updates.startDate = new Date(body.startDate);
      if (body.rentAmount) updates.rentAmount = Number(body.rentAmount) as any;
      if (body.deposit) updates.deposit = Number(body.deposit) as any;
      if (body.status) updates.status = String(body.status);
      if (body.documentUrl) updates.documentUrl = String(body.documentUrl);

      const updated = await prisma.lease.update({ where: { id }, data: updates });
      return res.status(200).json(updated);
    }

    if (req.method === 'POST') {
      // support actions like renew
      const body = typeof req.body === 'string' ? safeParse(req.body, {}) : (req.body || {});
      const action = String(body.action || '').toLowerCase();
      if (action === 'renew') {
        const newEnd = body.newEndDate ? new Date(body.newEndDate) : null;
        const newRent = body.newRent ? Number(body.newRent) : null;
        if (!newEnd) return res.status(400).json({ error: 'newEndDate required' });

        const updated = await prisma.lease.update({ where: { id }, data: { endDate: newEnd, status: 'renewed', rentAmount: newRent as any } });
        // create calendar event
        try {
          await prisma.calendarEvent.create({ data: { title: 'Lease Renewal', description: `Lease ${id} renewed`, dueDate: newEnd, propertyId: updated.propertyId } });
        } catch (e) {}

        return res.status(200).json(updated);
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    res.setHeader('Allow', 'GET, PATCH, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e: any) {
    console.error('leases/[id] error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
