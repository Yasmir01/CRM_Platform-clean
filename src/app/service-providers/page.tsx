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
      // expect { providers, total }
      const list = Array.isArray(json) ? json : json.providers ?? json.providers ?? [];
      setProviders(list || []);
      setTotal(json.total ?? (Array.isArray(json) ? json.length : 0));
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Service Providers</h1>

      <div className="flex justify-between items-center mb-4">
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
        <table className="min-w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-3 py-2 text-left">Name</th>
              <th className="border px-3 py-2 text-left">Category</th>
              <th className="border px-3 py-2 text-left">Phone</th>
              <th className="border px-3 py-2 text-left">Email</th>
              <th className="border px-3 py-2 text-left">Website</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center p-4">Loading...</td>
              </tr>
            ) : providers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-4 text-gray-500">No providers found</td>
              </tr>
            ) : (
              providers.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{p.name}</td>
                  <td className="border px-3 py-2">{p.service || '-'}</td>
                  <td className="border px-3 py-2">{p.phone || '-'}</td>
                  <td className="border px-3 py-2">{p.email || '-'}</td>
                  <td className="border px-3 py-2">
                    {p.website ? (
                      <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        {p.website}
                      </a>
                    ) : (
                      '-'
                    )}
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
