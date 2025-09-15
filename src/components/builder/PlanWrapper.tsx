"use client";
import React from "react";
import { useSession } from "@/auth/useSession";

export default function PlanWrapper({ allowedPlans, children }: { allowedPlans?: any; children: React.ReactNode }) {
  const session = useSession();
  // default: show when session unknown to avoid breaking preview
  if (!allowedPlans || (Array.isArray(allowedPlans) && allowedPlans.length === 0)) return <>{children}</>;

  // normalize allowedPlans to array of strings
  const plans: string[] = (Array.isArray(allowedPlans) ? allowedPlans : []).map((p: any) => (typeof p === 'string' ? p : p?.plan)).filter(Boolean);

  // if still empty, allow by default
  if (plans.length === 0) return <>{children}</>;

  // if session still loading, show children (preview safe)
  if (session.loading) return <>{children}</>;

  const userPlan = (session as any)?.user?.plan || (session as any)?.user?.roles?.[0] || null;

  // If we can't determine user's plan, show by default
  if (!userPlan) return <>{children}</>;

  if (plans.includes(userPlan)) return <>{children}</>;

  // not allowed
  return null;
}
