"use client";

import { useEffect, useState } from "react";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function fetchLeads() {
      const res = await fetch("/api/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      }
      setLoading(false);
    }
    fetchLeads();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  const exportCSV = () => {
    if (!leads || leads.length === 0) return;
    const headers = ["Name", "Email", "Property", "Message", "Status"];
    const rows = leads.map((l) => [
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
    if (!leads || leads.length === 0) return;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Leads Report", 14, 16);
    let y = 26;
    const lineHeight = 8;
    leads.forEach((l: any, i: number) => {
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

  const filteredLeads =
    statusFilter === "all" ? leads : leads.filter((l) => l.status === statusFilter);

  if (loading) return <p className="p-4">Loading leads...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Lead Management</h1>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="px-3 py-1 bg-blue-500 text-white rounded">
            Export CSV
          </button>
          <button onClick={exportPDF} className="px-3 py-1 bg-green-500 text-white rounded">
            Export PDF
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="mr-2">Filter by status:</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded p-1">
          <option value="all">All</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
        </select>
      </div>

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
            {filteredLeads.map((lead) => (
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
    </div>
  );
}
