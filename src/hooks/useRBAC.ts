"use client";

import { useMemo } from "react";
import { useSession } from "@/auth/useSession";
import { canClient } from "@/lib/rbacClient";

export function useRBAC(action: string) {
  const session = useSession();
  const role = (session as any)?.user?.role || (session as any)?.user?.roles?.[0];

  const allowed = useMemo(() => canClient(role, action), [role, action]);
  return allowed;
}
