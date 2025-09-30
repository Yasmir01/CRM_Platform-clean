export const PLAN_OPTIONS = ["Starter", "Pro", "Enterprise"] as const;
export type Plan = typeof PLAN_OPTIONS[number];
