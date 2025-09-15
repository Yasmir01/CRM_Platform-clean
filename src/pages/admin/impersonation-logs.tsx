import React, { useEffect, useState } from 'react';

export default function ImpersonationLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/api/admin/impersonation/logs');
        const data = await res.json();
        if (!mounted) return;
        setLogs(data || []);
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Impersonation Logs</h1>
      <table className="min-w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2">SU</th>
            <th className="border px-3 py-2">Subscriber</th>
            <th className="border px-3 py-2">Started</th>
            <th className="border px-3 py-2">Ended</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="border px-3 py-2">{log.superAdmin?.email || log.superAdminId}</td>
              <td className="border px-3 py-2">{log.subscriber?.companyName || log.subscriber?.name || log.subscriberId}</td>
              <td className="border px-3 py-2">{new Date(log.startedAt).toLocaleString()}</td>
              <td className="border px-3 py-2">{log.endedAt ? new Date(log.endedAt).toLocaleString() : 'Active'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
