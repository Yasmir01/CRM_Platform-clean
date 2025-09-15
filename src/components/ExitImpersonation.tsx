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
      // try to read impersonation token from cookies
      const cookie = document.cookie.split(';').map(c => c.trim()).find(c => c.startsWith('impersonationToken='));
      let subscriberId: string | null = null;
      if (cookie) {
        const token = cookie.split('=')[1];
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          subscriberId = payload.subscriberId || null;
        } catch (e) {
          // ignore
        }
      }

      if (subscriberId) {
        await fetch('/api/admin/impersonation/exit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscriberId }),
        });
      }
    } catch (e) {
      console.error('Failed to close impersonation log', e);
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
