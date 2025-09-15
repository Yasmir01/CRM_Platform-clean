"use client";

import React, { useEffect, useState } from 'react';

export default function ExitImpersonation() {
  const [isImpersonating, setIsImpersonating] = useState(false);

  useEffect(() => {
    const cookies = document.cookie.split(';').map((c) => c.trim());
    const has = cookies.some((c) => c.startsWith('impersonationToken='));
    setIsImpersonating(has);
  }, []);

  const exitImpersonation = async () => {
    try {
      const res = await fetch('/api/admin/stop-impersonation', { method: 'POST', credentials: 'include' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || 'Failed to stop impersonation');
        return;
      }
    } catch (e) {
      console.error(e);
    }

    // Clear cookie client-side as well
    document.cookie = 'impersonationToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/admin/dashboard';
  };

  if (!isImpersonating) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button onClick={exitImpersonation} className="px-4 py-2 bg-red-600 text-white rounded shadow-lg">Exit Impersonation</button>
    </div>
  );
}
