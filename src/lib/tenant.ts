import { prisma } from '../../api/_db';

export async function getActiveLeaseForTenant(tenantId: string) {
  const today = new Date();
  return prisma.lease.findFirst({ where: { tenantId, startDate: { lte: today }, OR: [{ endDate: null }, { endDate: { gte: today } }] } });
}
