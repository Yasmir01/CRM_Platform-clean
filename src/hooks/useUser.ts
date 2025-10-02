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
}
