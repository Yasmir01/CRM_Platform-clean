"use client";

import React, { useEffect, useState } from "react";

interface ServiceProvider {
  id: string;
  name: string;
  serviceType?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export default function ServiceProvidersPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<ServiceProvider>>({});

  // Load providers
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/service-providers");
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.providers ?? data;
        if (mounted) setProviders(list || []);
      } catch (err) {
        console.error(err);
        if (mounted) setProviders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    try {
      const res = await fetch("/api/service-providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Create failed');
      const created = await res.json();
      setProviders((prev) => [...prev, created]);
      setForm({});
    } catch (err) {
      console.error("Error creating provider:", err);
      alert('Failed to create provider');
    }
  };

  // Delete (use RESTful route)
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/service-providers/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) throw new Error('Delete failed');
      setProviders((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting provider:", err);
      alert('Failed to delete provider');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Service Providers</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Name"
          value={form.name || ""}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Service Type"
          value={form.serviceType || ""}
          onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Phone"
          value={form.phone || ""}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email || ""}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <textarea
          placeholder="Notes"
          value={form.notes || ""}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Add Provider</button>
      </form>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Service Type</th>
              <th className="border p-2 text-left">Phone</th>
              <th className="border p-2 text-left">Email</th>
              <th className="border p-2 text-left">Notes</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="border p-2">{p.name}</td>
                <td className="border p-2">{p.serviceType || (p as any).category || "-"}</td>
                <td className="border p-2">{p.phone || "-"}</td>
                <td className="border p-2">{p.email || "-"}</td>
                <td className="border p-2">{p.notes || "-"}</td>
                <td className="border p-2 text-center">
                  <button onClick={() => handleDelete(p.id)} className="px-2 py-1 bg-red-600 text-white rounded">Delete</button>
                </td>
              </tr>
            ))}

            {providers.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">No providers yet</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
