"use client";

import React, { useEffect, useState } from 'react';

export default function ImpersonationBanner() {
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/session', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        if (d?.impersonatedSubscriber) {
          setCompanyName(d.impersonatedSubscriber.companyName || null);
          setLogoUrl(d.impersonatedSubscriber.logoUrl || null);
        }
      })
      .catch(() => {});

    return () => { mounted = false };
  }, []);

  if (!companyName) return null;

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
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black px-6 py-3 shadow-md flex items-center justify-between">
      <div className="flex items-center gap-3">
        {logoUrl && <img src={logoUrl} alt={`${companyName} logo`} className="w-8 h-8 rounded shadow" />}
        <span className="font-semibold">🚨 You are impersonating: <strong className="ml-1">{companyName}</strong></span>
      </div>
      <button onClick={stop} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">Exit Impersonation</button>
    </div>
  );
}
