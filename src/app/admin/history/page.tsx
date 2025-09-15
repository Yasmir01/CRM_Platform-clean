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

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/admin/history");
        if (!res.ok) throw new Error("Failed to load history");
        const data = await res.json();
        const items: HistoryEntry[] = data.history || data;
        if (!mounted) return;
        setHistory(items);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="p-6">Loading history...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Super Admin Global History</h1>

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
