// src/hooks/useUser.ts
"use client";

import { useEffect, useState } from "react";

type Role = "SU" | "SA" | "Subscriber";

export type User = {
  email?: string;
  name?: string | null;
  role?: Role;
  subscriber?: any; // Keep this flexible for subscription details
};

export function useUser(email?: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchUser() {
      try {
        // Prefer `/api/auth/session` if available, otherwise fallback to `/api/me`
        const query = email ? `?email=${encodeURIComponent(email)}` : "";
        let res = await fetch(`/api/auth/session${query}`, { credentials: "include" });

        if (!res.ok) {
          // fallback to /api/me
          res = await fetch("/api/me", { credentials: "include" });
        }

        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();

        const role: Role = (data?.role as Role) || "Subscriber";

        const u: User = {
          email: data?.email,
          name: data?.name ?? null,
          role,
          subscriber: data?.subscriber,
        };

        if (mounted) setUser(u);
      } catch (err) {
        console.error("useUser: failed to fetch user", err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchUser();

    return () => {
      mounted = false;
    };
  }, [email]);

  return { user, loading };
}
