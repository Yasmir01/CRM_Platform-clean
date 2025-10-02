<<<<<<< HEAD
import { useEffect, useState } from 'react';

export default function useUser() {
  const [userState, setUserState] = useState<{ loading: boolean; user?: any; subscriber?: any }>({ loading: true });

  useEffect(() => {
    let mounted = true;
    fetch('/api/me', { credentials: 'include' }).then(async (r) => {
      if (!mounted) return;
      if (!r.ok) {
        setUserState({ loading: false });
        return;
      }
      const json = await r.json();
      setUserState({ loading: false, user: json.user, subscriber: json.subscriber });
    }).catch(() => { if (mounted) setUserState({ loading: false }); });

    return () => { mounted = false; };
  }, []);

  return userState;
=======
"use client";

import { useEffect, useState } from "react";

type Role = "SU" | "SA" | "Subscriber";

type User = {
  email?: string;
  name?: string | null;
  role: Role;
};

export function useUser(email?: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchUser() {
      try {
        const query = email ? `?email=${encodeURIComponent(email)}` : "";
        const res = await fetch(`/api/auth/session${query}`);
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();

        // Normalize role value if different casing
        const role = (data?.role as Role) || "Subscriber";

        const u: User = {
          email: data?.email,
          name: data?.name ?? null,
          role,
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
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
}
