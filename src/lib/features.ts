export const planFeatures: Record<string, Record<string, boolean>> = {
  FREE: {
    branding: false,
    exports: false,
    landingPages: true,
    reminders: false,
  },
  PRO: {
    branding: true,
    exports: true,
    landingPages: true,
    reminders: true,
  },
  ENTERPRISE: {
    branding: true,
    exports: true,
    landingPages: true,
    reminders: true,
  },
};

export function hasFeature(accountPlan: string | undefined, feature: keyof typeof planFeatures['FREE']) {
  const plan = String(accountPlan || 'FREE').toUpperCase();
  return (planFeatures as any)[plan]?.[feature] ?? false;
}
