"use client";

import { useEffect, useState } from "react";

export default function TenantPortal() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/tenant/reminders")
      .then((res) => res.json())
      .then(setReminders)
      .catch(() => setReminders([]));

    fetch("/api/tenant/history")
      .then((res) => res.json())
      .then(setHistory)
      .catch(() => setHistory([]));
  }, []);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Tenant Portal</h1>

      {/* Reminders */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Upcoming Reminders</h2>
        {reminders.length === 0 ? (
          <p className="text-gray-500">No reminders yet.</p>
        ) : (
          <ul className="space-y-2">
            {reminders.map((r) => (
              <li key={r.id} className="p-3 rounded border bg-yellow-50 flex justify-between">
                <span>
                  <strong>{r.type}</strong>: {r.message}
                </span>
                <span className="text-sm text-gray-600">{new Date(r.dueDate).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* History */}
      <section>
        <h2 className="text-xl font-semibold mb-4">History</h2>
        {history.length === 0 ? (
          <p className="text-gray-500">No history yet.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((h) => (
              <li key={h.id} className="p-3 rounded border bg-gray-50">
                <strong>{h.type}</strong>: {h.details}
                <div className="text-xs text-gray-500">{new Date(h.createdAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
