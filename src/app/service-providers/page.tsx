"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface ServiceProvider {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  companyId?: string;
  company?: { id: string; name: string };
}

export default function ServiceProvidersPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<ServiceProvider>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  async function fetchProviders() {
    setLoading(true);
    try {
      const res = await axios.get("/api/service-providers");
      // support both shapes: array or { data }
      const payload = res.data;
      const list = Array.isArray(payload) ? payload : (payload.data ?? payload.providers ?? payload);
      setProviders(list || []);
    } catch (err) {
      console.error("Error fetching providers:", err);
      setProviders([]);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put("/api/service-providers", { id: editingId, ...form });
      } else {
        await axios.post("/api/service-providers", form);
      }
      setForm({});
      setEditingId(null);
      fetchProviders();
    } catch (err) {
      console.error("Error saving provider:", err);
      alert('Failed to save provider');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this service provider?")) return;
    try {
      await axios.delete("/api/service-providers", { data: { id } });
      fetchProviders();
    } catch (err) {
      console.error("Error deleting provider:", err);
      alert('Failed to delete provider');
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Service Providers</h1>

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <input
          type="text"
          placeholder="Name"
          value={form.name || ""}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email || ""}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <input
          type="tel"
          placeholder="Phone"
          value={form.phone || ""}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Address"
          value={form.address || ""}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="border p-2 rounded w-full"
        />
        <textarea
          placeholder="Notes"
          value={form.notes || ""}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="border p-2 rounded w-full"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {editingId ? "Update Provider" : "Add Provider"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({});
            }}
            className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Providers Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Address</th>
              <th className="p-2 border">Notes</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => (
              <tr key={p.id}>
                <td className="p-2 border">{p.name}</td>
                <td className="p-2 border">{p.email || "-"}</td>
                <td className="p-2 border">{p.phone || "-"}</td>
                <td className="p-2 border">{p.address || "-"}</td>
                <td className="p-2 border">{p.notes || "-"}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => {
                      setEditingId(p.id);
                      setForm(p);
                    }}
                    className="text-blue-600 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
