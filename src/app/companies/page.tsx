"use client";

import React, { useEffect, useState } from "react";

interface Company {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  industry?: string | null;
  createdAt?: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/companies?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load companies");
      const json = await res.json();
      // support both { items, total } and { data, total }
      const items = json.items ?? json.data ?? json;
      const totalCount = json.total ?? 0;
      setCompanies(items || []);
      setTotal(totalCount);
    } catch (err) {
      console.error(err);
      setCompanies([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Companies</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search companies..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 rounded mb-4 w-full"
        onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); load(); } }}
      />

      {/* Page Size Selector */}
      <div className="mb-4">
        <label className="mr-2">Rows per page:</label>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
          className="border p-1 rounded"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading companies...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Created At</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50">
                <td className="p-2 border">{company.name}</td>
                <td className="p-2 border">{company.email || "-"}</td>
                <td className="p-2 border">{company.phone || "-"}</td>
                <td className="p-2 border">{company.createdAt ? new Date(company.createdAt).toLocaleDateString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="flex justify-between mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(Math.max(1, page - 1))}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => setPage(Math.min(page + 1, pageCount))}
          className="px-3 py-1 border rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
