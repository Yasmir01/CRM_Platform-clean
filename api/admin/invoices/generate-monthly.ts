import { prisma } from '../../_db';
import { ensurePermission } from '../../../src/lib/authorize';
import dayjs from 'dayjs';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = ensurePermission(req, res, '*');
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  if (!['ADMIN', 'SUPER_ADMIN'].includes(role)) return res.status(403).json({ error: 'Forbidden' });

  try {
    const { leaseId, totalAmount, dueDate, memo } = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    const lease = await prisma.lease.findUnique({
      where: { id: String(leaseId) },
      include: { participants: true, unit: { include: { property: true } } },
    });
    if (!lease) return res.status(404).json({ error: 'Lease not found' });

    const parts = lease.participants || [];
    const total = Number(totalAmount);
    if (!Number.isFinite(total) || total <= 0) return res.status(400).json({ error: 'Invalid totalAmount' });

    const equalCount = parts.filter((p: any) => p.shareType === 'EQUAL').length;
    const pctTotal = parts.filter((p: any) => p.shareType === 'PERCENTAGE').reduce((s: number, p: any) => s + Number(p.shareValue || 0), 0);
    const fixedTotal = parts.filter((p: any) => p.shareType === 'FIXED').reduce((s: number, p: any) => s + Number(p.shareValue || 0), 0);

    if (pctTotal && Math.abs(pctTotal - 100) > 0.001) return res.status(400).json({ error: 'Percentage shares must sum to 100' });
    if (fixedTotal && fixedTotal > total + 0.001) return res.status(400).json({ error: 'Fixed shares exceed total' });

    const remainingForEqual = total - fixedTotal - (total * (pctTotal / 100));
    const equalShare = equalCount ? remainingForEqual / equalCount : 0;

    const propertyId = lease.unit?.propertyId || (lease as any).propertyId || '';

    const invoice = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.create({
        data: {
          leaseId: String(leaseId),
          propertyId: String(propertyId),
          dueDate: dueDate ? new Date(dueDate) : dayjs().endOf('month').toDate(),
          totalAmount: total,
          balanceDue: total,
          status: 'OPEN',
          memo: memo ? String(memo) : 'Monthly Rent',
        },
      });

      for (const p of parts) {
        const amount = p.shareType === 'FIXED' ? Number(p.shareValue || 0)
          : p.shareType === 'PERCENTAGE' ? total * (Number(p.shareValue || 0) / 100)
          : equalShare;
        await tx.invoiceLine.create({
          data: {
            invoiceId: inv.id,
            description: 'Monthly Rent Share',
            amount: Number(Number(amount).toFixed(2)),
            billToTenantId: String(p.tenantId),
          },
        });
      }

      return inv;
    });

    return res.status(200).json(invoice);
  } catch (e: any) {
    console.error('invoices/generate-monthly POST error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
