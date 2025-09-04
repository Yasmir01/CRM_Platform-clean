import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { ensurePermission } from '../../src/lib/authorize';

const AMOUNT_TYPES = new Set(['FULL_RENT', 'FIXED', 'PERCENTAGE']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method || 'GET';

  if (!['GET', 'PUT', 'DELETE'].includes(method)) {
    res.setHeader('Allow', 'GET, PUT, DELETE');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) return res.status(403).json({ error: 'Forbidden' });

  try {
    if (method === 'GET') {
      const list = await prisma.autoPay.findMany({
        include: { tenant: true, property: true, lease: { include: { unit: true } } },
        orderBy: { createdAt: 'desc' },
      } as any);
      const enriched = list.map((a: any) => ({
        ...a,
        tenantName: a.tenant?.name || a.tenant?.email || a.tenantId,
        propertyName: a.property?.address || a.propertyId || '-',
        leaseName: a.lease?.unit ? `${a.lease.unit.number}` : (a.leaseId || '-'),
        amount: Number(a.amountValue ?? a.amount ?? 0),
        frequency: a.frequency || 'monthly',
        splitEmails: Array.isArray(a.splitEmails) ? a.splitEmails : [],
      }));
      return res.status(200).json(enriched);
    }

    if (method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const id = String(body.id || '');
      if (!id) return res.status(400).json({ error: 'Missing id' });

      const data: any = {};
      if (body.active !== undefined) data.active = Boolean(body.active);
      if (body.dayOfMonth !== undefined) {
        const day = Number(body.dayOfMonth);
        if (!Number.isInteger(day) || day < 1 || day > 31) return res.status(400).json({ error: 'Invalid dayOfMonth' });
        data.dayOfMonth = day;
      }
      if (body.amountType !== undefined) {
        const t = String(body.amountType).toUpperCase();
        if (!AMOUNT_TYPES.has(t)) return res.status(400).json({ error: 'Invalid amountType' });
        data.amountType = t;
      }
      if (body.amountValue !== undefined) {
        const v = body.amountValue === null ? null : Number(body.amountValue);
        if (v !== null && !Number.isFinite(v)) return res.status(400).json({ error: 'Invalid amountValue' });
        data.amountValue = v;
      }

      // If switching to FULL_RENT, clear amountValue
      if (data.amountType === 'FULL_RENT') data.amountValue = null;

      const updated = await prisma.autoPay.update({ where: { id }, data });
      return res.status(200).json(updated);
    }

    if (method === 'DELETE') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const id = String(body.id || '');
      if (!id) return res.status(400).json({ error: 'Missing id' });
      await prisma.autoPay.delete({ where: { id } });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e: any) {
    console.error('admin/autopay error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
