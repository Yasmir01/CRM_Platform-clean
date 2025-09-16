"use client";

import React, { useEffect, useState } from "react";

type Company = {
  id: string;
  name: string;
  industry?: string | null;
  website?: string | null;
  createdAt: string;
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<keyof Company>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const LIMIT = 10;

  const fetchCompanies = async (p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(LIMIT), sortField: String(sortField), sortOrder });
      const res = await fetch(`/api/companies?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setCompanies(data.data || []);
      setHasMore(Boolean(data.hasMore));
      setTotalPages(data.totalPages || 1);
      setPage(data.page || p);
    } catch (err) {
      console.error('fetchCompanies error', err);
      setCompanies([]);
      setHasMore(false);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(1); }, [sortField, sortOrder]);
  useEffect(() => { fetchCompanies(page); }, [page]);

  const handleSort = (field: keyof Company) => {
    if (sortField === field) setSortOrder((o) => o === 'asc' ? 'desc' : 'asc'); else { setSortField(field); setSortOrder('asc'); }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Companies</h1>

      <div className="bg-white shadow rounded-2xl overflow-hidden">
        <table className="min-w-full divide-y w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('name')}>Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('industry')}>Industry {sortField === 'industry' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
              <th className="px-4 py-2">Website</th>
              <th className="px-4 py-2 cursor-pointer" onClick={() => handleSort('createdAt')}>Created At {sortField === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-4">Loading...</td></tr>
            ) : companies.length === 0 ? (
              <tr><td colSpan={4} className="p-4">No companies found.</td></tr>
            ) : (
              companies.map((company) => (
                <tr key={company.id} className="border-t">
                  <td className="px-4 py-3">{company.name}</td>
                  <td className="px-4 py-3">{company.industry || '-'}</td>
                  <td className="px-4 py-3">{company.website ? <a href={company.website} target="_blank" rel="noreferrer" className="text-blue-600 underline">{company.website}</a> : '-'}</td>
                  <td className="px-4 py-3">{new Date(company.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between mt-4">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Previous</button>
        <span className="text-sm text-gray-600 self-center">Page {page} of {totalPages}</span>
        <button onClick={() => setPage((p) => p + 1)} disabled={!hasMore} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  );
}
