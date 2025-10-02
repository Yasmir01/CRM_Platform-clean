"use client";

import React, { useEffect, useState } from 'react';

export default function AccountingDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/api/accounting/dashboard');
        const d = await res.json();
        if (!mounted) return;
        if (!res.ok) throw new Error(d?.error || 'Failed to load');
        setMetrics(d);
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  async function handleExport() {
    window.location.href = '/api/accounting/export';
  }

  async function handleQuickbooksSync() {
    try {
      const res = await fetch('/api/sync/quickbooks', { method: 'POST' });
      const d = await res.json();
      if (!res.ok) throw new Error(d?.error || 'Sync failed');
      alert(`Sync started: ${d.count} items`);
    } catch (e: any) {
      alert(e?.message || 'Sync failed');
    }
  }

  if (loading) return <div className="p-6">Loading accounting…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">💰 Accounting Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Rent Collected (MTD)</div>
          <div className="text-xl font-semibold">${(metrics?.rentCollected || 0).toLocaleString()}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Outstanding Balances</div>
          <div className="text-xl font-semibold">${(metrics?.outstanding || 0).toLocaleString()}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Expenses</div>
          <div className="text-xl font-semibold">${(metrics?.expenses || 0).toLocaleString()}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Net Income</div>
          <div className="text-xl font-semibold">${(metrics?.netIncome || 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={handleExport} className="px-4 py-2 bg-gray-200 rounded">📤 Export CSV</button>
        <button onClick={handleQuickbooksSync} className="px-4 py-2 bg-blue-600 text-white rounded">🔄 Sync with QuickBooks</button>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Notes</h2>
        <p className="text-sm text-gray-600">QuickBooks/Xero/Wave sync is a stub. Connect your OAuth credentials to enable full sync. Feature gating: Pro+ required for direct integrations.</p>
      </div>
    </div>
  );
}
