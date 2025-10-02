export type Plan = "basic" | "pro" | "enterprise";

export const planFeatures: Record<Plan, Record<string, boolean>> = {
  basic: {
    email: true,
    sms: false,
    reports: false,
    reminders: false,
    landingPages: true,
    customDomain: false,
  },
  pro: {
    email: true,
    sms: true,
    reports: true,
    reminders: true,
    landingPages: true,
    customDomain: false,
  },
  enterprise: {
    email: true,
    sms: true,
    reports: true,
    reminders: true,
    landingPages: true,
    customDomain: true,
  },
};

export function canUseFeature(plan: Plan | string | undefined, feature: string) {
  const p = String(plan || "").toLowerCase() as Plan;
  return (planFeatures[p] && Boolean((planFeatures as any)[p][feature])) || false;
}

export function canUseLandingPages(plan: Plan | string | undefined) {
  return canUseFeature(plan, "landingPages");
}

export function canUseCustomDomain(plan: Plan | string | undefined) {
  return canUseFeature(plan, "customDomain");
}

export function landingPageLimit(plan: Plan | string | undefined) {
  const p = String(plan || "").toLowerCase();
  if (p === "basic") return 1;
  return Infinity;
}

export function canUseReminders(plan: Plan | string | undefined) {
  const p = String(plan || "").toLowerCase();
  return p === "pro" || p === "enterprise";
}
