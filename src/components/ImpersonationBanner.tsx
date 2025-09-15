import { useEffect, useState } from 'react';

"use client";

import React, { useEffect, useState } from 'react';

export default function ImpersonationBanner() {
  const [impersonatingEmail, setImpersonatingEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/session', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        if (d?.impersonating) {
          // show subscriber email if available, otherwise show impersonating id
          const label = d.user?.email || d.impersonating || null;
          setImpersonatingEmail(label);
        }
      })
      .catch(() => {});

    return () => { mounted = false };
  }, []);

  if (!impersonatingEmail) return null;

  async function stop() {
    try {
      await fetch('/api/superadmin/stop-impersonation', { method: 'POST', credentials: 'include' });
    } catch (e) {
      // ignore
    }
    // return to admin area
    window.location.href = '/admin/leads';
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black px-6 py-3 shadow-md flex justify-between items-center">
      <span className="font-semibold">
        🚨 You are impersonating: <strong className="ml-1">{impersonatingEmail}</strong>
      </span>
      <button onClick={stop} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">Exit Impersonation</button>
    </div>
  );
}
