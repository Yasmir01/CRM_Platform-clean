import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../../src/utils/authz';
import { prisma } from '../../_db';
import { safeParse } from '../../../src/utils/safeJson';
import bcrypt from 'bcrypt';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = String((req.query as any)?.id || '');
  if (!id) return res.status(400).json({ error: 'Missing id' });
  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    if (req.method === 'GET') {
      const app = await prisma.application.findUnique({ where: { id } });
      if (!app) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(app);
    }

    if (req.method === 'PATCH') {
      const body = typeof req.body === 'string' ? safeParse(req.body, {}) : (req.body || {});
      const updates: any = {};
      if (body.status) updates.status = String(body.status);
      if (body.screeningResult) updates.screeningResult = String(body.screeningResult);
      if (body.documentUrl) updates.documentUrl = String(body.documentUrl);

      const updated = await prisma.application.update({ where: { id }, data: updates });
      return res.status(200).json(updated);
    }

    if (req.method === 'POST') {
      // actions like review/approve/reject
      const body = typeof req.body === 'string' ? safeParse(req.body, {}) : (req.body || {});
      const action = String(body.action || '').toLowerCase();

      if (action === 'approve') {
        // perform screening stub if requested
        const screening = body.screening || { status: 'manual_review' };
        await prisma.application.update({ where: { id }, data: { status: 'approved', screeningResult: JSON.stringify(screening) } });

        const app = await prisma.application.findUnique({ where: { id } });
        if (!app) return res.status(404).json({ error: 'Application not found after update' });

        // Find or create user by email
        let tenantUser = await prisma.user.findUnique({ where: { email: app.email } });
        if (!tenantUser) {
          const randomPass = Math.random().toString(36).slice(2, 10) + '!' ;
          const hashed = await bcrypt.hash(randomPass, 10);
          tenantUser = await prisma.user.create({ data: { email: app.email, name: app.applicantName || undefined, password: hashed, role: 'Tenant' } as any });
        }

        // Create lease - require rent and dates from body or fallback
        const rentAmount = body.rentAmount ? Number(body.rentAmount) : (app.income ? Number(app.income) : 0);
        const startDate = body.startDate ? new Date(body.startDate) : new Date();
        const endDate = body.endDate ? new Date(body.endDate) : new Date(new Date().setFullYear(new Date().getFullYear() + 1));

        const lease = await prisma.lease.create({ data: { propertyId: app.propertyId, unit: app.unit || '', tenantId: tenantUser.id, rentAmount: rentAmount as any, startDate, endDate } });

        // create initial transaction (pending rent charge)
        try {
          await prisma.transaction.create({ data: { tenantId: tenantUser.id, propertyId: app.propertyId, type: 'rent', amount: rentAmount as any, status: 'pending', description: `Monthly Rent - Lease ${lease.id}` } });
        } catch (e) {}

        return res.status(200).json({ success: true, leaseId: lease.id, tenantId: tenantUser.id });
      }

      if (action === 'reject') {
        await prisma.application.update({ where: { id }, data: { status: 'rejected', screeningResult: JSON.stringify({ reason: body.reason || 'rejected by manager' }) } });
        return res.status(200).json({ success: true });
      }

      return res.status(400).json({ error: 'Unknown action' });
    }

    res.setHeader('Allow', 'GET, PATCH, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e: any) {
    console.error('applications/[id] error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
