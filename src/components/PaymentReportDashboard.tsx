import React, { useState } from "react";

type ExportFormat = "pdf" | "csv";

export default function PaymentReportDashboard() {
  const [filter, setFilter] = useState<string>("all");
  const [exporting, setExporting] = useState(false);
  const [exportId, setExportId] = useState<string>("");

  function handleExport(type: ExportFormat) {
    // Build URL and include id when filtering by tenant or lease
    let url = `/api/export/${type}?filter=${encodeURIComponent(filter)}`;
    if ((filter === 'tenant' || filter === 'lease') && exportId) {
      url += `&id=${encodeURIComponent(exportId)}`;
    }
    window.open(url, "_blank");
  }

  return (
    <div className="payment-report-card p-6 bg-white rounded-2xl shadow">
      <h2 className="payment-report-title text-xl font-bold mb-4">Payment Reporting Dashboard</h2>

      <div className="payment-report-filters flex items-center gap-3 mb-6">
        <label className="font-medium">Filter by:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select border rounded-lg p-2"
        >
          <option value="all">All</option>
          <option value="lease">Per Lease</option>
          <option value="tenant">Per Tenant</option>
        </select>
      </div>

      <div className="payment-report-actions flex gap-4">
        <button
          onClick={() => handleExport("pdf")}
          className="btn-export-pdf bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          disabled={exporting}
        >
          {exporting ? "Exporting..." : "Export PDF"}
        </button>

        <button
          onClick={() => handleExport("csv")}
          className="btn-export-csv bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          disabled={exporting}
        >
          {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>
    </div>
  );
}
