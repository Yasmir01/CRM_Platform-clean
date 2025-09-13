"use client";

import React, { useEffect, useState } from "react";

type BillingInvoice = {
  id: string;
  number: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
  pdfUrl: string;
  createdAt: string;
  account?: { id: string; name?: string } | null;
};

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [filtered, setFiltered] = useState<BillingInvoice[]>([]);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/admin/invoices")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data)) {
          setInvoices(data);
          setFiltered(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const applyFilters = () => {
    let result = invoices.slice();

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((inv) => (inv.account?.name || "").toLowerCase().includes(q));
    }

    if (dateRange.from && dateRange.to) {
      const from = new Date(dateRange.from).getTime();
      const to = new Date(dateRange.to).getTime();
      result = result.filter((inv) => {
        const created = new Date(inv.createdAt).getTime();
        return created >= from && created <= to;
      });
    }

    setFiltered(result);
  };

  const exportCSV = () => {
    const rows = [
      ["Account", "Invoice #", "Period", "Amount"],
      ...filtered.map((inv) => [
        inv.account?.name ?? "Unknown",
        inv.number,
        `${new Date(inv.periodStart).toLocaleDateString()} - ${new Date(inv.periodEnd).toLocaleDateString()}`,
        `$${(inv.amount / 100).toFixed(2)}`,
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "invoices.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("All Subscriber Invoices", 14, 20);

    let y = 30;
    filtered.forEach((inv) => {
      const line = `${inv.account?.name ?? "Unknown"} | Invoice #${inv.number} | $${(inv.amount / 100).toFixed(2)}`;
      doc.setFontSize(10);
      doc.text(line, 14, y);
      y += 8;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save("invoices.pdf");
  };

  return (
    <div className="admin-invoices-page p-8">
      <h1 className="admin-invoices-title text-2xl font-bold mb-6">All Subscriber Invoices</h1>

      {/* Filters */}
      <div className="filters-row flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by Account"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-input border px-3 py-2 rounded"
        />

        <input
          type="date"
          value={dateRange.from}
          onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
          className="filter-input border px-3 py-2 rounded"
        />

        <input
          type="date"
          value={dateRange.to}
          onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          className="filter-input border px-3 py-2 rounded"
        />

        <button onClick={applyFilters} className="btn-apply bg-blue-600 text-white px-4 py-2 rounded">
          Apply Filters
        </button>

        <button onClick={exportCSV} className="btn-csv bg-green-600 text-white px-4 py-2 rounded">
          Export CSV
        </button>

        <button onClick={exportPDF} className="btn-pdf bg-purple-600 text-white px-4 py-2 rounded">
          Export PDF
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="admin-invoices-loading">Loading...</div>
      ) : (
        <div className="admin-invoices-table-wrap">
          <table className="admin-invoices-table w-full border-collapse text-sm">
            <thead>
              <tr className="admin-invoices-head bg-gray-100 text-left">
                <th className="admin-th p-2">Account</th>
                <th className="admin-th p-2">Invoice #</th>
                <th className="admin-th p-2">Period</th>
                <th className="admin-th p-2">Amount</th>
                <th className="admin-th p-2">Download</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id} className="admin-tr border-t">
                  <td className="admin-td p-2">{inv.account?.name ?? "Unknown"}</td>
                  <td className="admin-td p-2">{inv.number}</td>
                  <td className="admin-td p-2">
                    {new Date(inv.periodStart).toLocaleDateString()} - {new Date(inv.periodEnd).toLocaleDateString()}
                  </td>
                  <td className="admin-td p-2">${(inv.amount / 100).toFixed(2)}</td>
                  <td className="admin-td p-2">
                    {inv.pdfUrl ? (
                      <a className="admin-download text-blue-600 underline" href={inv.pdfUrl} target="_blank" rel="noreferrer">
                        Download PDF
                      </a>
                    ) : (
                      <span className="admin-no-pdf text-gray-500">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
