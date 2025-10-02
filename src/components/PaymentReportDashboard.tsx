import React, { useState } from "react";

import React, { useEffect, useState } from "react";

type ExportFormat = "pdf" | "csv";

export default function PaymentReportDashboard() {
  const [filter, setFilter] = useState<string>("all");
  const [exporting, setExporting] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const [tenants, setTenants] = useState<{ id: string; name: string }[]>([]);
  const [leases, setLeases] = useState<{ id: string }[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [recipient, setRecipient] = useState<string>("");

  useEffect(() => {
    setSelectedId("");
    if (filter === "tenant") {
      fetch('/api/tenants')
        .then((r) => r.json())
        .then((data) => setTenants(Array.isArray(data) ? data : []))
        .catch((err) => {
          console.error('Failed to load tenants', err);
          setTenants([]);
        });
    } else if (filter === "lease") {
      fetch('/api/leases')
        .then((r) => r.json())
        .then((data) => setLeases(Array.isArray(data) ? data : []))
        .catch((err) => {
          console.error('Failed to load leases', err);
          setLeases([]);
        });
    }
  }, [filter]);

  function handleExport(type: ExportFormat) {
    // Build URL and include id when filtering by tenant or lease
    let url = `/api/export/${type}?filter=${encodeURIComponent(filter)}`;
    if ((filter === 'tenant' || filter === 'lease') && selectedId) {
      url += `&id=${encodeURIComponent(selectedId)}`;
    }
    if (startDate) url += `&startDate=${encodeURIComponent(startDate)}`;
    if (endDate) url += `&endDate=${encodeURIComponent(endDate)}`;
    window.open(url, "_blank");
  }

  async function handleEmailExport(type: ExportFormat) {
    if (!recipient) return window.alert('Please enter a recipient email');

    try {
      const res = await fetch('/api/export/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filter,
          id: selectedId || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          type,
          recipient,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to send email');
      window.alert(data.message || 'Email sent');
    } catch (err: any) {
      console.error('Email export error:', err);
      window.alert(`Email export failed: ${err?.message || String(err)}`);
    }
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

        {filter === 'tenant' && (
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="filter-select border rounded-lg p-2 ml-2"
          >
            <option value="">Select Tenant</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        )}

        {filter === 'lease' && (
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="filter-select border rounded-lg p-2 ml-2"
          >
            <option value="">Select Lease</option>
            {leases.map((l) => (
              <option key={l.id} value={l.id}>
                Lease #{l.id}
              </option>
            ))}
          </select>
        )}

        {/* Date range inputs */}
        <div className="date-range flex items-center gap-2 ml-2">
          <label className="font-medium">Start:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-lg p-2"
          />
          <label className="font-medium">End:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-lg p-2"
          />
        </div>
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

      {/* Email export UI */}
      <div className="mt-6 flex items-center gap-2">
        <input
          type="email"
          placeholder="Recipient email"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="border rounded-lg p-2 w-64 mr-2"
        />
        <button
          onClick={() => handleEmailExport("pdf")}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 mr-2"
        >
          Email PDF
        </button>
        <button
          onClick={() => handleEmailExport("csv")}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
        >
          Email CSV
        </button>
      </div>

      {/* Send to Owner quick actions */}
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => {
            fetch('/api/export/email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                filter,
                id: selectedId,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                type: 'pdf',
                recipient: 'owner',
              }),
            })
              .then((r) => r.json())
              .then((data) => window.alert(data.message || data.error || 'Email sent'))
              .catch((err) => {
                console.error('Send to owner error', err);
                window.alert('Failed to send to owner');
              });
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 mr-2"
          disabled={filter !== 'lease' || !selectedId}
        >
          Send PDF to Owner
        </button>

        <button
          onClick={() => {
            fetch('/api/export/email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                filter,
                id: selectedId,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                type: 'csv',
                recipient: 'owner',
              }),
            })
              .then((r) => r.json())
              .then((data) => window.alert(data.message || data.error || 'Email sent'))
              .catch((err) => {
                console.error('Send to owner error', err);
                window.alert('Failed to send to owner');
              });
          }}
          className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
          disabled={filter !== 'lease' || !selectedId}
        >
          Send CSV to Owner
        </button>
      </div>
    </div>
  );
}
