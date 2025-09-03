import { useEffect, useState } from 'react';

export default function ImpersonationBanner() {
  const [impersonatingEmail, setImpersonatingEmail] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/session', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d?.impersonating && d?.user?.email) {
          setImpersonatingEmail(d.user.email);
        }
      })
      .catch(() => {});
  }, []);

  if (!impersonatingEmail) return null;

  async function stop() {
    await fetch('/api/superadmin/stop-impersonation', { method: 'POST', credentials: 'include' });
    window.location.href = '/superadmin';
  }

  return (
    <div className="bg-yellow-200 text-yellow-900 p-2 text-center">
      <span>⚠️ You are impersonating <b>{impersonatingEmail}</b>. </span>
      <button onClick={stop} className="underline text-blue-600 hover:text-blue-800">Stop & Return</button>
    </div>
  );
}
