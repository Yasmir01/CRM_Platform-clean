"use client";

import { useEffect, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface ServiceProvider {
  id: string;
  name: string;
  serviceType?: string;
  phone?: string | null;
  email?: string | null;
  createdAt: string;
}

export default function ServiceProvidersPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        if (search && search.trim()) params.set('search', search.trim());
        const res = await fetch(`/api/service-providers?${params.toString()}`, { signal: controller.signal });
        const data = await res.json();
        // support both shapes
        const list = Array.isArray(data) ? data : (data.providers ?? data.providers ?? []);
        setProviders(list || []);
        setTotal(data.total ?? (Array.isArray(data) ? data.length : list.length));
      } catch (err) {
        if ((err as any)?.name === 'AbortError') return;
        console.error('Failed to fetch providers', err);
        setProviders([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
    return () => controller.abort();
  }, [search, page, pageSize]);

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Service Providers</h1>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded">
          <AddIcon fontSize="small" />
          Add Provider
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search providers..."
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          className="border rounded px-3 py-2 w-1/3"
        />

        <select
          value={pageSize}
          onChange={(e) => { setPage(1); setPageSize(Number(e.target.value)); }}
          className="border rounded px-2 py-1"
        >
          <option value={10}>10 / page</option>
          <option value={25}>25 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border text-left">Name</th>
              <th className="p-2 border text-left">Service Type</th>
              <th className="p-2 border text-left">Phone</th>
              <th className="p-2 border text-left">Email</th>
              <th className="p-2 border text-left">Created At</th>
              <th className="p-2 border text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center p-4">Loading...</td>
              </tr>
            ) : providers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">No providers found</td>
              </tr>
            ) : (
              providers.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{p.name}</td>
                  <td className="p-2 border">{p.serviceType || '-'}</td>
                  <td className="p-2 border">{p.phone || '-'}</td>
                  <td className="p-2 border">{p.email || '-'}</td>
                  <td className="p-2 border">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="p-2 border">
                    <div className="flex gap-2">
                      <button className="px-2 py-1 border rounded text-gray-700"><EditIcon fontSize="small" /></button>
                      <button className="px-2 py-1 bg-red-600 text-white rounded"><DeleteIcon fontSize="small" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span>Page {page} of {totalPages}</span>

        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
