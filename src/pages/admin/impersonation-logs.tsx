import React, { useEffect, useState } from 'react';
import { ControlledFeature } from '@/components/ControlledFeature';

export default function ImpersonationLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'suppressed'>('all');
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [settings, setSettings] = useState<any>(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/org-settings/current');
      if (!res.ok) {
        setSettings(null);
        return;
      }
      const s = await res.json();
      setSettings(s || null);
    } catch (e) {
      // ignore
    }
  };

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

    // fetch org settings in parallel and listen for changes
    fetchSettings();
    const onSettingsChanged = () => fetchSettings();
    window.addEventListener('orgSettingsChanged', onSettingsChanged as EventListener);

    return () => { mounted = false; window.removeEventListener('orgSettingsChanged', onSettingsChanged as EventListener); };
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
      const url = buildExportUrl('pdf');
      window.open(url, '_blank');
    } catch (e) {}
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

        <ControlledFeature
          enabled={Boolean(settings?.allowExport)}
          disabledLabel="Export options are disabled for this organization. Contact your SuperAdmin if you need access."
          className="ml-auto"
        >
          <div className="export-actions flex items-center gap-2">
            <button onClick={exportCSV} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Export CSV</button>
            <button onClick={exportPDF} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Export PDF</button>
          </div>
        </ControlledFeature>
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
