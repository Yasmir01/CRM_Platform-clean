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
    return res.json({ ok: true, invoice: upd });
  },
});
