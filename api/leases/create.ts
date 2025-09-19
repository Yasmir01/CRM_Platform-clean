import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../src/utils/authz';
import { prisma } from '../_db';
import { safeParse } from '../../src/utils/safeJson';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    const body = typeof req.body === 'string' ? safeParse(req.body, {}) : (req.body || {});
    const propertyId = String(body.propertyId || '').trim();
    const unit = String(body.unit || '').trim();
    const tenantId = body.tenantId ? String(body.tenantId) : undefined;
    const rentAmount = Number(body.rentAmount || 0);
    const deposit = Number(body.deposit || 0) || undefined;
    const startDate = body.startDate ? new Date(body.startDate) : null;
    const endDate = body.endDate ? new Date(body.endDate) : null;
    const documentUrl = body.documentUrl ? String(body.documentUrl) : undefined;

    if (!propertyId || !unit || !startDate || !endDate || !rentAmount) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const lease = await prisma.lease.create({
      data: {
        propertyId,
        unit,
        tenantId: tenantId || undefined,
        rentAmount: rentAmount as any,
        deposit: deposit as any,
        startDate,
        endDate,
        documentUrl,
      },
    });

    // Optionally create initial transaction (one-off) - create pending monthly charge
    try {
      await prisma.transaction.create({
        data: {
          tenantId: tenantId || undefined,
          propertyId,
          type: 'rent',
          amount: rentAmount as any,
          status: 'pending',
          description: `Monthly rent for lease ${lease.id}`,
        },
      });
    } catch (e) {
      console.warn('Failed creating initial transaction for lease', e);
    }

    return res.status(200).json(lease);
  } catch (e: any) {
    console.error('leases/create error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
