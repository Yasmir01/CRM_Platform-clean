import { prisma } from '../_db';

export type EscalationTier = { level: number; role: string; hoursAfterDeadline: number };

export async function getEscalationPolicy(propertyId?: string | null, planId?: string | null): Promise<EscalationTier[]> {
  // Property-level override
  if (propertyId) {
    const propPolicy = await prisma.escalationMatrix.findMany({
      where: { propertyId },
      orderBy: { level: 'asc' },
      select: { level: true, role: true, hoursAfterDeadline: true },
    });
    if (propPolicy.length) return propPolicy;
  }

  // Subscription plan override
  if (planId) {
    const planPolicy = await prisma.escalationMatrix.findMany({
      where: { subscriptionPlanId: planId },
      orderBy: { level: 'asc' },
      select: { level: true, role: true, hoursAfterDeadline: true },
    });
    if (planPolicy.length) return planPolicy;
  }

  // Global defaults
  const globalPolicy = await prisma.escalationMatrix.findMany({
    where: { propertyId: null, subscriptionPlanId: null },
    orderBy: { level: 'asc' },
    select: { level: true, role: true, hoursAfterDeadline: true },
  });
  if (globalPolicy.length) return globalPolicy;

  // Hardcoded safe defaults
  return [
    { level: 1, role: 'ADMIN', hoursAfterDeadline: 0 },
    { level: 2, role: 'MANAGER', hoursAfterDeadline: 24 },
    { level: 3, role: 'SUPER_ADMIN', hoursAfterDeadline: 48 },
  ];
}
