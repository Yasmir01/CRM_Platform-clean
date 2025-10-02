"use client";
import React from 'react';
<<<<<<< HEAD
import useUser from '@/hooks/useUser';
=======
import { useUser } from '@/hooks/useUser';
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9

export default function PlanWrapper({ allowedPlans, forceShow, forceHide, children }: { allowedPlans?: any; forceShow?: boolean; forceHide?: boolean; children: React.ReactNode }) {
  const { loading, user, subscriber } = useUser();

  // SA/SU detection
  const isSuperAdmin = !!(user && (user.role === 'SUPER_ADMIN' || user.role === 'SYS_ADMIN'));

  // force hide always wins
  if (forceHide) return null;

  // force show allows SA/SU to view regardless of plan
  if (forceShow && isSuperAdmin) return <>{children}</>;

  // normalize allowedPlans
  const plans: string[] = Array.isArray(allowedPlans) ? allowedPlans.map((p: any) => (typeof p === 'string' ? p : p?.plan)).filter(Boolean) : [];

  // show if not restrictive
  if (!plans || plans.length === 0) return <>{children}</>;

  // while loading, show children for preview
  if (loading) return <>{children}</>;

  const userPlan = (subscriber && subscriber.plan) || (user && (user.plan || user.role)) || null;
  if (!userPlan) return <>{children}</>;

  if (plans.includes(userPlan)) return <>{children}</>;

  // not allowed — show upgrade placeholder
  return (
    <div className="p-4 text-sm text-gray-600 border border-dashed border-gray-300 rounded-lg bg-gray-50">
      Upgrade your plan to unlock this feature.
    </div>
  );
}
