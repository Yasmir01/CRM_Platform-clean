import React, { useEffect, useState } from 'react';

interface ReportLog {
  id: string;
  recipient: string;
  reportType: string;
  filter: string;
  filterId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  sentAt: string;
}

export default function ReportLogs() {
  const [logs, setLogs] = useState<ReportLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // filters
  const [recipient, setRecipient] = useState('');
  const [reportType, setReportType] = useState('');
  const [filter, setFilter] = useState('');
  const [filterId, setFilterId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const buildParams = (forExport = false) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '10',
    });
    if (recipient) params.append('recipient', recipient);
    if (reportType) params.append('reportType', reportType);
    if (filter) params.append('filter', filter);
    if (filterId) params.append('filterId', filterId);
    if (startDate && endDate) {
      params.append('startDate', startDate);
      params.append('endDate', endDate);
    }
    if (forExport) {
      params.delete('page');
      params.delete('limit');
    }
    return params;
  };

  const fetchLogs = () => {
    const params = buildParams();
    fetch(`/api/report-logs?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setLogs(data.logs || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch((err) => {
        console.error('Failed to fetch report logs', err);
        setLogs([]);
        setTotalPages(1);
      });
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleApply = () => {
    setPage(1);
    fetchLogs();
  };

  const handleReset = () => {
    setRecipient('');
    setReportType('');
    setFilter('');
    setFilterId('');
    setStartDate('');
    setEndDate('');
    setPage(1);
    fetchLogs();
  };

  const exportLogs = (format: 'csv' | 'pdf') => {
    const params = buildParams(true);
    params.append('format', format);
    window.open(`/api/report-logs/export?${params.toString()}`, '_blank');
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow mt-6">
      <h2 className="text-xl font-bold mb-4">Report Email Logs</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search recipient"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="border rounded-lg p-2"
        />
        <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="border rounded-lg p-2">
          <option value="">All Types</option>
          <option value="pdf">PDF</option>
          <option value="csv">CSV</option>
        </select>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded-lg p-2">
          <option value="">Any Filter</option>
          <option value="all">all</option>
          <option value="lease">lease</option>
          <option value="tenant">tenant</option>
        </select>
        <input
          type="text"
          placeholder="Filter ID (leaseId/tenantId)"
          value={filterId}
          onChange={(e) => setFilterId(e.target.value)}
          className="border rounded-lg p-2"
        />
        <div className="flex items-center gap-2">
          <label>From:</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded-lg p-2" />
          <label>To:</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded-lg p-2" />
        </div>
        <button onClick={handleApply} className="px-3 py-1 bg-blue-600 text-white rounded">
          Apply
        </button>
        <button onClick={handleReset} className="px-3 py-1 bg-gray-300 rounded">
          Reset
        </button>

        {/* Export buttons */}
        <div className="ml-auto flex gap-2">
          <button onClick={() => exportLogs('csv')} className="px-3 py-1 bg-green-600 text-white rounded">
            Export CSV
          </button>
          <button onClick={() => exportLogs('pdf')} className="px-3 py-1 bg-purple-600 text-white rounded">
            Export PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Recipient</th>
            <th className="p-2 border">Type</th>
            <th className="p-2 border">Filter</th>
            <th className="p-2 border">Filter ID</th>
            <th className="p-2 border">Date Range</th>
            <th className="p-2 border">Sent At</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="p-2 border">{log.recipient}</td>
              <td className="p-2 border uppercase">{log.reportType}</td>
              <td className="p-2 border">{log.filter}</td>
              <td className="p-2 border">{log.filterId || '-'}</td>
              <td className="p-2 border">
                {log.startDate && log.endDate ? `${new Date(log.startDate).toLocaleDateString()} → ${new Date(log.endDate).toLocaleDateString()}` : '-'}
              </td>
              <td className="p-2 border">{new Date(log.sentAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">
          Next
        </button>
      </div>
    </div>
  );
}
