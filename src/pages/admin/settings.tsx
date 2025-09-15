"use client";

import React, { useEffect, useState } from 'react';

export default function AdminSettings() {
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/api/admin/config/impersonation-alerts');
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        if (!mounted) return;
        setAlertsEnabled(Boolean(data.impersonationAlerts));
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const toggleAlerts = async () => {
    const newVal = !alertsEnabled;
    setAlertsEnabled(newVal);
    try {
      await fetch('/api/admin/config/impersonation-alerts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: newVal }) });
    } catch (e) {
      // ignore
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">System Settings</h1>

      <div className="flex items-center justify-between border p-4 rounded shadow">
        <div>
          <p className="font-medium">Impersonation Email Alerts</p>
          <p className="text-sm text-gray-500">Send an email notification whenever SU starts or exits impersonation.</p>
        </div>
        <button onClick={toggleAlerts} className={`px-3 py-1 rounded ${alertsEnabled ? 'bg-red-600' : 'bg-green-600'} text-white`}>
          {alertsEnabled ? 'Disable' : 'Enable'}
        </button>
      </div>
    </div>
  );
}
