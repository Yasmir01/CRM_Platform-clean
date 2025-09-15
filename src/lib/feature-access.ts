import { prisma } from './prisma';

export async function hasFeatureAccess(userId: string, feature: string) {
  if (!userId) return false;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, role: true, orgId: true, accountId: true } });
  if (!user) return false;

  const role = String(user.role || '').toUpperCase();
  if (role === 'SUPER_ADMIN' || role === 'SUPERADMIN') return true;

  // Attempt to resolve subscriber:
  // 1) try to find subscriber by matching user email
  // 2) (optional) could try orgId/accountId mappings if present
  let subscriber = null;
  try {
    if (user.email) {
      subscriber = await prisma.subscriber.findFirst({ where: { email: user.email }, include: { plan: true } });
    }
  } catch (e) {
    // ignore
  }

  // If not found, try to find by account/org mapping via landing pages or other heuristics
  if (!subscriber) {
    try {
      // try to find subscriber by accountId via account relation if user has accountId
      if ((user as any).accountId) {
        const acc = await prisma.account.findUnique({ where: { id: (user as any).accountId }, include: { leads: true } });
        // no direct subscriber mapping here; fallthrough
      }
    } catch (e) {
      // ignore
    }
  }

  if (!subscriber) return false;

  const plan = subscriber.plan;
  const force = subscriber.forceAllowExports || subscriber.forceAllowReminders || subscriber.forceAllowLandingPages || subscriber.forceAllowBranding || false;

  switch (feature) {
    case 'exports':
      return Boolean(plan?.allowExports) || Boolean(subscriber.forceAllowExports);
    case 'reminders':
      return Boolean(plan?.allowReminders) || Boolean(subscriber.forceAllowReminders);
    case 'landingPages':
      return Boolean(plan?.allowLandingPages) || Boolean(subscriber.forceAllowLandingPages);
    case 'branding':
      return Boolean(plan?.allowBranding) || Boolean(subscriber.forceAllowBranding);
    default:
      return false;
  }
}
