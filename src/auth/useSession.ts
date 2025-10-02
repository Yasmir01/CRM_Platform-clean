import { useEffect, useState } from "react";

type User = { id: string; email: string; roles: string[] };
export type Session = { authenticated: boolean; user?: User };

export function useSession() {
  const [session, setSession] = useState<Session>({ authenticated: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/session", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setSession(data))
      .catch(() => setSession({ authenticated: false }))
      .finally(() => setLoading(false));
  }, []);

  return { ...session, loading };
}
