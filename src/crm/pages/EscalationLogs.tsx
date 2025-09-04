import React from 'react';

export default function EscalationLogsTable() {
  const [logs, setLogs] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/escalations/logs', { credentials: 'include' });
    const d = await r.json();
    setLogs(Array.isArray(d) ? d : []);
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const filtered = logs.filter((l) =>
    `${l.request?.title || ''} ${l.request?.property?.address || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Escalation Logs</h2>

      <div className="flex items-center gap-2 mb-4">
        <input
          className="border rounded p-2 flex-1"
          placeholder="Search by request or property..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="border rounded px-3 py-2" onClick={() => load()}>Refresh</button>
        <button className="border rounded px-3 py-2" onClick={() => window.open('/api/escalations/logs/export/csv', '_blank')}>Export CSV</button>
        <button className="border rounded px-3 py-2" onClick={() => window.open('/api/escalations/logs/export/pdf', '_blank')}>Export PDF</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Request</th>
              <th className="p-2 text-left">Property</th>
              <th className="p-2 text-left">Level</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Triggered At</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{log.request?.title}</td>
                <td className="p-2">{log.request?.property?.address}</td>
                <td className="p-2">Level {log.level}</td>
                <td className="p-2">{log.role}</td>
                <td className="p-2">{new Date(log.triggeredAt).toLocaleString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">No logs found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
