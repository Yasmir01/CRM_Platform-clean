"use client";
import React from 'react';
import useUser from '@/hooks/useUser';

export default function PlanWrapper({ allowedPlans, children }: { allowedPlans?: any; children: React.ReactNode }) {
  const { loading, user, subscriber } = useUser();

  // normalize allowedPlans
  const plans: string[] = Array.isArray(allowedPlans) ? allowedPlans.map((p: any) => (typeof p === 'string' ? p : p?.plan)).filter(Boolean) : [];

  // show if not restrictive
  if (!plans || plans.length === 0) return <>{children}</>;

  // while loading, show children for preview
  if (loading) return <>{children}</>;

  const userPlan = (subscriber && subscriber.plan) || (user && (user.plan || user.role)) || null;
  if (!userPlan) return <>{children}</>;

  if (plans.includes(userPlan)) return <>{children}</>;

  return <div className="p-4 text-sm text-gray-600">Upgrade your plan to unlock this feature.</div>;
}
