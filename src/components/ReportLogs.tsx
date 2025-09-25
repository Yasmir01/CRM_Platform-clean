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
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`/api/report-logs?page=${page}&limit=10`)
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setLogs(Array.isArray(data.logs) ? data.logs : []);
        setTotalPages(Number(data.totalPages || 1));
      })
      .catch((err) => {
        console.error('Failed to load report logs', err);
        if (mounted) setLogs([]);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [page]);

  return (
    <div className="p-6 bg-white rounded-2xl shadow mt-6">
      <h2 className="text-xl font-bold mb-4">Report Email Logs</h2>

      {loading ? (
        <div className="py-8 text-center">Loading...</div>
      ) : (
        <div className="overflow-x-auto">
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
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-sm text-gray-500">
                    No logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="p-2 border">{log.recipient}</td>
                    <td className="p-2 border uppercase">{log.reportType}</td>
                    <td className="p-2 border">{log.filter}</td>
                    <td className="p-2 border">{log.filterId || '-'}</td>
                    <td className="p-2 border">
                      {log.startDate && log.endDate
                        ? `${new Date(log.startDate).toLocaleDateString()} → ${new Date(log.endDate).toLocaleDateString()}`
                        : '-'}
                    </td>
                    <td className="p-2 border">{new Date(log.sentAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
