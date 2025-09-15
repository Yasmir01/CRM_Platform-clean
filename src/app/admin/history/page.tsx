"use client";

import React, { useEffect, useState } from "react";

interface HistoryEntry {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
  user: { email: string; role: string } | null;
  subscriber?: { name?: string; companyName?: string; logoUrl?: string } | null;
}

export default function AdminHistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionFilter, setActionFilter] = useState<string>('');
  const [subscriberFilter, setSubscriberFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  async function fetchHistory() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (actionFilter) params.append('action', actionFilter);
      if (subscriberFilter) params.append('subscriberId', subscriberFilter);
      if (search) params.append('search', search);
      const res = await fetch(`/api/admin/history?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load history');
      const data = await res.json();
      const items: HistoryEntry[] = data.history || data;
      setHistory(items);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div className="p-6">Loading history...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Super Admin Global History</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Action</label>
          <select className="border rounded px-3 py-2" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            <option value="">All</option>
            <option value="ImpersonationStarted">Impersonation Started</option>
            <option value="ImpersonationStopped">Impersonation Stopped</option>
            <option value="TenantUpdated">Tenant Updated</option>
            <option value="PaymentRecorded">Payment Recorded</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Subscriber ID</label>
          <input type="text" placeholder="Enter subscriber ID" className="border rounded px-3 py-2" value={subscriberFilter} onChange={(e) => setSubscriberFilter(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Search</label>
          <input type="text" placeholder="Search email, details, or company" className="border rounded px-3 py-2" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <button onClick={fetchHistory} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Apply Filters</button>
      </div>

      <div className="space-y-4">
        {history.length === 0 && <div className="text-gray-600">No history found.</div>}

        {history.map((entry) => {
          const isImpersonation = entry.action === "ImpersonationStarted" || entry.action === "ImpersonationStopped";
          const subscriberName = entry.subscriber?.companyName || entry.subscriber?.name || null;

          return (
            <div
              key={entry.id}
              className={`p-4 rounded shadow ${
                isImpersonation ? "bg-yellow-100 border-l-4 border-yellow-500" : "bg-white border"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold">{entry.action}</span>{" "}
                  <span className="text-gray-600">
                    by {entry.user?.email || "system"} ({entry.user?.role || "-"})
                    {subscriberName && (
                      <>
                        {" "}&rarr; <strong className="text-blue-600">{subscriberName}</strong>
                      </>
                    )}
                  </span>
                </div>
                <span className="text-sm text-gray-500">{new Date(entry.createdAt).toLocaleString()}</span>
              </div>

              {entry.details && (
                <pre className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded break-words">
                  {typeof entry.details === "string" ? entry.details : JSON.stringify(entry.details, null, 2)}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
