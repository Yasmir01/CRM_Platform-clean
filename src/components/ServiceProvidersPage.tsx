"use client";
import React, { useEffect, useState } from "react";

interface Company {
  id: string;
  name: string;
}

interface ServiceProvider {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  companyId?: string;
  company?: { id: string; name: string };
}

export default function ServiceProvidersPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ServiceProvider | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", companyId: "" });

  // Fetch providers + companies
  useEffect(() => {
    fetchProviders();
    fetchCompanies();
  }, []);

  async function fetchProviders() {
    setLoading(true);
    try {
      const res = await fetch("/api/service-providers");
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.data ?? data.providers ?? data);
      setProviders(list);
    } catch (err) {
      console.error("Error fetching providers:", err);
      setProviders([]);
    }
    setLoading(false);
  }

  async function fetchCompanies() {
    try {
      const res = await fetch("/api/companies");
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.data ?? data.companies ?? data);
      setCompanies(list || []);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setCompanies([]);
    }
  }

  // Handle form submit (create or edit)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const method = editing ? "PUT" : "POST";
    const body = editing ? { ...form, id: editing.id } : form;

    await fetch("/api/service-providers", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setForm({ name: "", email: "", phone: "", companyId: "" });
    setEditing(null);
    fetchProviders();
  }

  // Handle delete
  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this provider?")) return;

    await fetch("/api/service-providers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    fetchProviders();
  }

  if (loading) return <p className="p-4">Loading service providers...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Service Providers</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 p-4 border border-gray-300 rounded-lg shadow-sm bg-gray-50"
      >
        <h2 className="text-lg font-semibold mb-2">
          {editing ? "Edit Provider" : "Add Provider"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border p-2 rounded w-full"
          />
          <input
            type="text"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="border p-2 rounded w-full"
          />

          {/* Dropdown for Company */}
          <select
            value={form.companyId}
            onChange={(e) => setForm({ ...form, companyId: e.target.value })}
            className="border p-2 rounded w-full"
          >
            <option value="">-- Select Company --</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {editing ? "Update Provider" : "Add Provider"}
        </button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm({ name: "", email: "", phone: "", companyId: "" });
            }}
            className="mt-4 ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Providers table */}
      <table className="w-full border-collapse border border-gray-300 shadow-md rounded-lg">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2 text-left">Name</th>
            <th className="border border-gray-300 p-2 text-left">Email</th>
            <th className="border border-gray-300 p-2 text-left">Phone</th>
            <th className="border border-gray-300 p-2 text-left">Company</th>
            <th className="border border-gray-300 p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 p-2">{p.name}</td>
              <td className="border border-gray-300 p-2">{p.email || "-"}</td>
              <td className="border border-gray-300 p-2">{p.phone || "-"}</td>
              <td className="border border-gray-300 p-2">{p.company?.name || "-"}</td>
              <td className="border border-gray-300 p-2 space-x-2">
                <button
                  onClick={() => {
                    setEditing(p);
                    setForm({
                      name: p.name,
                      email: p.email || "",
                      phone: p.phone || "",
                      companyId: p.companyId || "",
                    });
                  }}
                  className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
