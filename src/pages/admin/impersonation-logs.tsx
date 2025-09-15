import React, { useEffect, useState } from 'react';

export default function ImpersonationLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'suppressed'>('all');
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

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

    // Date range filtering (apply even when there's no search)
    const logDate = new Date(log.startedAt);
    let matchesDate = true;
    if (fromDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      if (logDate < from) matchesDate = false;
    }
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      if (logDate > to) matchesDate = false;
    }
    if (!matchesDate) return false;

    if (!search) return true;
    const q = search.toLowerCase();
    const adminEmail = (log.superAdmin?.email || log.superAdminId || '').toString().toLowerCase();
    const adminId = (log.superAdminId || '').toString().toLowerCase();
    const subscriberName = (log.subscriber?.companyName || log.subscriber?.name || log.subscriberId || '').toString().toLowerCase();
    const subscriberId = (log.subscriberId || '').toString().toLowerCase();

    return adminEmail.includes(q) || adminId.includes(q) || subscriberName.includes(q) || subscriberId.includes(q);
  });

  const escapeHtml = (str: any) => String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const buildExportUrl = (format: 'csv' | 'pdf') => {
    const params = new URLSearchParams();
    params.set('format', format);
    if (search) params.set('search', search);
    if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);
    return `/api/impersonation-logs-export?${params.toString()}`;
  };

  const exportCSV = () => {
    try {
      const url = buildExportUrl('csv');
      window.open(url, '_blank');
    } catch (e) {}
  };

  const exportPDF = () => {
    try {
      const win = window.open('', '_blank');
      if (!win) return;
      const style = `<style>body{font-family:Arial,Helvetica,sans-serif;padding:16px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}thead{background:#f3f4f6;font-weight:600}</style>`;
      const rowsHtml = (filteredLogs || []).map((log) => {
        const admin = (log.superAdmin?.email || log.superAdminId || '').toString();
        const subscriber = (log.subscriber?.companyName || log.subscriber?.name || log.subscriberId || '').toString();
        const started = new Date(log.startedAt).toLocaleString();
        const ended = log.endedAt ? new Date(log.endedAt).toLocaleString() : 'Active';
        const status = log.alertSent ? 'Sent' : 'Suppressed';
        return `<tr><td>${escapeHtml(admin)}</td><td>${escapeHtml(subscriber)}</td><td>${escapeHtml(started)}</td><td>${escapeHtml(ended)}</td><td>${escapeHtml(status)}</td></tr>`;
      }).join('');
      const html = `<!doctype html><html><head><title>Impersonation Logs</title>${style}</head><body><h1>Impersonation Logs</h1><table><thead><tr><th>Super Admin</th><th>Subscriber</th><th>Started</th><th>Ended</th><th>Alert Status</th></tr></thead><tbody>${rowsHtml}</tbody></table></body></html>`;
      win.document.open();
      win.document.write(html);
      win.document.close();
      win.focus();
      // trigger print; user can save as PDF from print dialog
      win.print();
    } catch (e) {
      // ignore
    }
  };

  if (loading) return <p className="p-6 text-gray-500">Loading logs...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Impersonation Logs</h1>

      <div className="filters-container flex justify-between items-start gap-4 mb-4">
        <div className="filters-left flex items-center gap-4">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="status-select border px-2 py-1 rounded">
            <option value="all">All</option>
            <option value="sent">Alert Sent</option>
            <option value="suppressed">Alert Suppressed</option>
          </select>

          <input
            type="text"
            aria-label="Search logs by Super Admin or Subscriber"
            placeholder="Search by Super Admin or Subscriber"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input border px-2 py-1 rounded flex-1"
          />

          <div className="date-range flex items-center gap-2">
            <label className="text-sm">From:</label>
            <input
              type="date"
              aria-label="Filter logs from date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="date-input border px-2 py-1 rounded"
            />
            <label className="text-sm">To:</label>
            <input
              type="date"
              aria-label="Filter logs to date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="date-input border px-2 py-1 rounded"
            />
          </div>

          <button onClick={() => { setSearch(''); setStatusFilter('all'); setFromDate(''); setToDate(''); }} className="clear-filters px-3 py-1 bg-gray-200 rounded">Clear Filters</button>
        </div>

        <div className="export-actions flex items-center gap-2 ml-auto">
          <button onClick={exportCSV} className="px-3 py-1 bg-blue-600 text-white rounded">Export CSV</button>
          <button onClick={exportPDF} className="px-3 py-1 bg-green-600 text-white rounded">Export PDF</button>
        </div>
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
