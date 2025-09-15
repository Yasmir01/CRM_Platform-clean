import React, { useEffect, useState } from 'react';

export default function ImpersonationLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'suppressed'>('all');
  const [search, setSearch] = useState('');

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

  const filteredLogs = logs.filter((log) => {
    const matchesStatus = statusFilter === 'all' ? true : statusFilter === 'sent' ? log.alertSent : !log.alertSent;
    if (!matchesStatus) return false;

    if (!search) return true;
    const q = search.toLowerCase();
    const adminEmail = (log.superAdmin?.email || log.superAdminId || '').toString().toLowerCase();
    const adminId = (log.superAdminId || '').toString().toLowerCase();
    const subscriberName = (log.subscriber?.companyName || log.subscriber?.name || log.subscriberId || '').toString().toLowerCase();
    const subscriberId = (log.subscriberId || '').toString().toLowerCase();

    return adminEmail.includes(q) || adminId.includes(q) || subscriberName.includes(q) || subscriberId.includes(q);
  });

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Impersonation Logs</h1>

      <div className="flex items-center gap-4 mb-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="border px-2 py-1 rounded">
          <option value="all">All</option>
          <option value="sent">Alert Sent</option>
          <option value="suppressed">Alert Suppressed</option>
        </select>

        <input
          type="text"
          placeholder="Search by Super Admin or Subscriber"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-2 py-1 rounded flex-1"
        />

        <button onClick={() => { setSearch(''); setStatusFilter('all'); }} className="px-3 py-1 bg-gray-200 rounded">Reset</button>
      </div>

      <table className="min-w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Super Admin</th>
            <th className="p-2 border">Subscriber</th>
            <th className="p-2 border">Started</th>
            <th className="p-2 border">Ended</th>
            <th className="p-2 border">Alert Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((log) => (
            <tr key={log.id}>
              <td className="p-2 border">{log.superAdmin?.email || log.superAdminId}</td>
              <td className="p-2 border">{log.subscriber?.companyName || log.subscriber?.name || log.subscriberId}</td>
              <td className="p-2 border">{new Date(log.startedAt).toLocaleString()}</td>
              <td className="p-2 border">{log.endedAt ? new Date(log.endedAt).toLocaleString() : 'Active'}</td>
              <td className="p-2 border">{log.alertSent ? <span className="text-green-600 font-semibold">Sent</span> : <span className="text-gray-500 italic">Suppressed</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredLogs.length === 0 && (
        <p className="text-gray-500 mt-4">No logs found.</p>
      )}
    </div>
  );
}
