"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    let mounted = true;
    async function fetchLeads() {
      const res = await fetch("/api/leads");
      if (!mounted) return;
      if (res.ok) {
        const data = await res.json();
        setLeads(data || []);
      }
      setLoading(false);
    }
    fetchLeads();
    return () => {
      mounted = false;
    };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/leads/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  const filteredLeads = useMemo(() => {
    const byStatus = statusFilter === "all" ? leads : leads.filter((l) => l.status === statusFilter);
    if (!search) return byStatus;
    const q = search.toLowerCase().trim();
    return byStatus.filter((l) => {
      const hay = [l.name, l.email, l.landingPage?.property?.name, l.message]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [leads, statusFilter, search]);

  // Chart data
  const leadsByProperty = useMemo(() => {
    const acc: Record<string, any> = {};
    for (const l of leads) {
      const property = l.landingPage?.property?.name || "Unknown";
      acc[property] = acc[property] || { property, count: 0 };
      acc[property].count++;
    }
    return Object.values(acc);
  }, [leads]);

  const leadsByStatus = useMemo(() => {
    const acc: Record<string, any> = {};
    for (const l of leads) {
      const s = l.status || "unknown";
      acc[s] = acc[s] || { status: s, count: 0 };
      acc[s].count++;
    }
    return Object.values(acc);
  }, [leads]);

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const paginatedLeads = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, page]);

  useEffect(() => {
    // reset to first page when filters change
    setPage(1);
  }, [statusFilter, search]);

  const exportCSV = () => {
    const rowsSource = filteredLeads;
    if (!rowsSource || rowsSource.length === 0) return;
    const headers = ["Name", "Email", "Property", "Message", "Status"];
    const rows = rowsSource.map((l) => [
      l.name ?? "",
      l.email ?? "",
      l.landingPage?.property?.name ?? "",
      (l.message || "").replace(/\n/g, " "),
      l.status ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    const rowsSource = filteredLeads;
    if (!rowsSource || rowsSource.length === 0) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Leads Report", 14, 16);
    let y = 26;
    const lineHeight = 8;
    rowsSource.forEach((l: any, i: number) => {
      const text = `${i + 1}. ${l.name || ""} (${l.email || ""}) - ${l.landingPage?.property?.name || ""} [${l.status || ""}]`;
      const split = doc.splitTextToSize(text, 180);
      doc.text(split, 14, y);
      y += split.length * lineHeight;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
    doc.save("leads.pdf");
  };

  if (loading) return <p className="p-4">Loading leads...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Lead Management</h1>

      {/* --- Charts --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Leads by Property */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Leads by Property</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={leadsByProperty}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="property" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Leads by Status */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Leads by Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={leadsByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                {leadsByStatus.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- Filters + Table + Pagination (same as before) --- */}

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div>
          <label className="mr-2">Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded p-1">
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
          </select>
        </div>

        <div>
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded p-1"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Property</th>
              <th className="border p-2">Message</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLeads.map((lead) => (
              <tr key={lead.id} className="border-b align-top">
                <td className="border p-2 align-top">{lead.name}</td>
                <td className="border p-2 align-top">{lead.email}</td>
                <td className="border p-2 align-top">{lead.landingPage?.property?.name}</td>
                <td className="border p-2 align-top">{lead.message}</td>
                <td className="border p-2 align-top">{lead.status}</td>
                <td className="border p-2 align-top">
                  <select value={lead.status} onChange={(e) => updateStatus(lead.id, e.target.value)} className="border rounded p-1">
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="converted">Converted</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-4 gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
