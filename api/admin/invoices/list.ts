import { defineHandler } from '../../_handler';
import { prisma } from '../../_db';
import { requireRole } from '../../../src/lib/roles';

export default defineHandler({
  methods: ['GET'],
  roles: ['ADMIN', 'SUPER_ADMIN'],
  fn: async ({ res, user }) => {
    requireRole(user, ['ADMIN', 'SUPER_ADMIN']);

    const orgId = String((user as any).orgId || '');
    if (!orgId) return res.status(400).json({ error: 'org_required' });

    const invoices = await prisma.maintenanceInvoice.findMany({
      where: { request: { orgId } },
      orderBy: { uploadedAt: 'desc' },
      include: {
        vendor: { select: { id: true, name: true, email: true } },
        request: { select: { id: true, propertyId: true, unitId: true, orgId: true } },
        files: true,
      },
    } as any);

    return res.json({ invoices });
  },
});
