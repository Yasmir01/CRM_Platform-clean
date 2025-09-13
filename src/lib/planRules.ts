export type Plan = "basic" | "pro" | "enterprise";

export function canUseEmail(plan: Plan | string | undefined) {
  // All plans can use email by default
  return true;
}

export function canUseSMS(plan: Plan | string | undefined) {
  const p = String(plan || "").toLowerCase();
  return p === "pro" || p === "enterprise";
}
