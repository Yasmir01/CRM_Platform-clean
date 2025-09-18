"use client";

import { useEffect, useState } from "react";

interface ServiceProvider {
  id: string;
  name: string;
  service?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  company?: { id: string; name?: string } | null;
  createdAt: string;
}

export default function ServiceProvidersPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form state
  const [editing, setEditing] = useState<ServiceProvider | null>(null);
  const [form, setForm] = useState({ name: "", category: "", phone: "", email: "", website: "" });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(`/api/service-providers?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch providers");
      const json = await res.json();
      const list = Array.isArray(json) ? json : json.providers ?? [];
      setProviders(list || []);
      setTotal(json.total ?? (Array.isArray(json) ? json.length : list.length || 0));
    } catch (err) {
      console.error(err);
      setProviders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, debouncedSearch]);

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  const startEdit = (p: ServiceProvider) => {
    setEditing(p);
    setForm({ name: p.name || "", category: (p as any).category || p.service || "", phone: p.phone || "", email: p.email || "", website: p.website || "" });
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ name: "", service: "", phone: "", email: "", website: "" });
  };

  const handleSave = async () => {
    try {
      if (editing) {
        const res = await fetch(`/api/service-providers/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Update failed');
      } else {
        const res = await fetch(`/api/service-providers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Create failed');
      }
      resetForm();
      fetchProviders();
    } catch (err) {
      console.error('Save provider error', err);
      alert('Failed to save provider');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this provider?')) return;
    try {
      const res = await fetch(`/api/service-providers/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) throw new Error('Delete failed');
      // If deleting current edited item clear form
      if (editing?.id === id) resetForm();
      fetchProviders();
    } catch (err) {
      console.error('Delete provider error', err);
      alert('Failed to delete provider');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Service Providers</h1>

      {/* Form */}
      <div className="border rounded p-4 mb-6 bg-gray-50">
        <h2 className="font-semibold mb-2">{editing ? 'Edit Provider' : 'Add Provider'}</h2>
        <div className="grid grid-cols-2 gap-4">
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border rounded px-2 py-1" />
          <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border rounded px-2 py-1" />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border rounded px-2 py-1" />
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="border rounded px-2 py-1" />
          <input placeholder="Website" value={form.website || ''} onChange={(e) => setForm({ ...form, website: e.target.value })} className="border rounded px-2 py-1 col-span-2" />
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={handleSave} className="px-3 py-1 bg-blue-600 text-white rounded">{editing ? 'Update' : 'Save'}</button>
          {editing && (
            <button onClick={resetForm} className="px-3 py-1 bg-gray-400 text-white rounded">Cancel</button>
          )}
        </div>
      </div>

      {/* Search + Page size */}
      <div className="flex justify-between items-center mb-4">
        <input type="text" placeholder="Search providers..." value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} className="border rounded px-3 py-2 w-1/3" />

        <select value={pageSize} onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)); }} className="border rounded px-2 py-1">
          <option value={10}>10 / page</option>
          <option value={25}>25 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2 text-left">Name</th>
              <th className="border px-3 py-2 text-left">Category</th>
              <th className="border px-3 py-2 text-left">Phone</th>
              <th className="border px-3 py-2 text-left">Email</th>
              <th className="border px-3 py-2 text-left">Website</th>
              <th className="border px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center p-4">Loading...</td></tr>
            ) : providers.length === 0 ? (
              <tr><td colSpan={6} className="text-center p-4 text-gray-500">No providers found</td></tr>
            ) : (
              providers.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{p.name}</td>
                  <td className="border px-3 py-2">{(p as any).category || p.service || '-'}</td>
                  <td className="border px-3 py-2">{p.phone || '-'}</td>
                  <td className="border px-3 py-2">{p.email || '-'}</td>
                  <td className="border px-3 py-2">{p.website ? (<a href={p.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{p.website}</a>) : '-'}</td>
                  <td className="border px-3 py-2 flex gap-2">
                    <button onClick={() => { startEdit(p); }} className="px-2 py-1 bg-yellow-500 text-white rounded">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="px-2 py-1 bg-red-600 text-white rounded">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage((p) => Math.min(p + 1, totalPages))} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  );
}
