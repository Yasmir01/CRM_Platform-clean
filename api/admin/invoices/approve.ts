import { defineHandler } from '../../_handler';
import { prisma } from '../../_db';
import { z } from 'zod';
import { requireRole } from '../../../src/lib/roles';

const Body = z.object({ invoiceId: z.string(), approve: z.boolean().default(true) });

export default defineHandler({
  methods: ['POST'],
  roles: ['ADMIN', 'SUPER_ADMIN'],
  bodySchema: Body,
  fn: async ({ res, body, user }) => {
    requireRole(user, ['ADMIN', 'SUPER_ADMIN']);

    const inv = await prisma.maintenanceInvoice.findUnique({
      where: { id: body.invoiceId },
      include: { request: { select: { orgId: true } } },
    } as any);
    if (!inv) return res.status(404).json({ error: 'invoice_not_found' });

    const orgId = String((user as any).orgId || '');
    if (!orgId || inv.request?.orgId !== orgId) return res.status(403).json({ error: 'forbidden' });

    if (!body.approve) {
      const rej = await prisma.maintenanceInvoice.update({ where: { id: inv.id }, data: { status: 'rejected' } });
      return res.json({ ok: true, invoice: rej });
    }

    const upd = await prisma.maintenanceInvoice.update({ where: { id: inv.id }, data: { status: 'approved' } });

    // Create ledger entry for accounting (expense)
    try {
      await prisma.ledgerEntry.create({
        data: {
          leaseId: inv.requestId || null,
          propertyId: inv.propertyId || null,
          amountCents: Math.round((inv.amount || 0) * 100),
          type: 'expense',
          description: `Maintenance invoice approved: ${inv.id}`,
          createdBy: String((user as any).sub || (user as any).id || ''),
        } as any,
      });
    } catch (e) {
      console.warn('Failed to create ledger entry for maintenance invoice', e);
    }

    // Notify vendor (if any) and tenant about approval
    try {
      const vendor = inv.vendorId ? await prisma.user.findUnique({ where: { id: inv.vendorId } }) : null;
      if (vendor && vendor.email) {
        await prisma.notification.create({ data: { title: 'Invoice Approved', message: `Invoice ${inv.id} has been approved for payment.`, audience: 'VENDOR', createdBy: String((user as any).sub || (user as any).id || ''), } });
      }
    } catch (e) {
      console.warn('Failed to notify vendor about invoice approval', e);
    }

    return res.json({ ok: true, invoice: upd });
  },
});
