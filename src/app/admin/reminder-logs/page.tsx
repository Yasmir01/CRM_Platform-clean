"use client";
import { useEffect, useState } from "react";

export default function AdminReminderLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filters, setFilters] = useState({ reminderId: "", channel: "", status: "", since: "", until: "" });

  async function fetchLogs() {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
    const res = await fetch(`/api/admin/reminder-logs?${params.toString()}`);
    if (res.ok) setLogs(await res.json());
  }

  useEffect(() => { fetchLogs(); }, []);

  const exportCsv = () => {
    if (!logs.length) return;
    const headers = ["createdAt", "reminderId", "channel", "status", "initiatedBy", "note"];
    const rows = logs.map(l => [l.createdAt, l.reminderId, l.channel, l.status, l.initiatedBy, JSON.stringify(l.response || l.note || "")]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "reminder-logs.csv"; document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Reminder Audit Logs</h1>

      <div className="mb-4 flex gap-2">
        <input placeholder="reminderId" value={filters.reminderId} onChange={e=>setFilters({...filters, reminderId: e.target.value})} className="border p-2" />
        <input placeholder="channel" value={filters.channel} onChange={e=>setFilters({...filters, channel: e.target.value})} className="border p-2" />
        <input placeholder="status" value={filters.status} onChange={e=>setFilters({...filters, status: e.target.value})} className="border p-2" />
        <input type="date" value={filters.since} onChange={e=>setFilters({...filters, since: e.target.value})} className="border p-2" />
        <input type="date" value={filters.until} onChange={e=>setFilters({...filters, until: e.target.value})} className="border p-2" />
        <button onClick={fetchLogs} className="px-3 py-2 bg-blue-600 text-white rounded">Apply</button>
        <button onClick={exportCsv} className="px-3 py-2 bg-gray-700 text-white rounded">Export CSV</button>
      </div>

      <div className="overflow-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Time</th>
              <th className="p-2">Reminder</th>
              <th className="p-2">Channel</th>
              <th className="p-2">Status</th>
              <th className="p-2">By</th>
              <th className="p-2">Response / Note</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id} className="border-t">
                <td className="p-2">{new Date(l.createdAt).toLocaleString()}</td>
                <td className="p-2">{l.reminder?.type} ({l.reminderId})</td>
                <td className="p-2">{l.channel}</td>
                <td className="p-2">{l.status}</td>
                <td className="p-2">{l.initiatedBy}</td>
                <td className="p-2"><pre className="text-xs">{JSON.stringify(l.response || l.note || "", null, 2)}</pre></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
