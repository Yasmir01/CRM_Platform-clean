"use client";

import { useEffect, useState } from "react";

interface Deal {
  id: string;
  title: string;
  value: number;
  status: string;
  company?: { name?: string } | null;
  contact?: { firstName?: string; lastName?: string } | null;
  createdAt?: string;
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
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

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(`/api/deals?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch deals");
      const json = await res.json();
      setDeals(json.data ?? json.deals ?? []);
      setTotal(json.total ?? 0);
    } catch (err) {
      console.error("Failed to fetch deals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Deals</h1>

      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search deals..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="border p-2 rounded w-1/2"
        />

        <select
          value={pageSize}
          onChange={(e) => {
            setPage(1);
            setPageSize(parseInt(e.target.value, 10));
          }}
          className="border p-2 rounded"
        >
          <option value={10}>10 / page</option>
          <option value={25}>25 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Title</th>
            <th className="p-2 border">Value</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Company</th>
            <th className="p-2 border">Contact</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} className="text-center py-4">Loading...</td>
            </tr>
          ) : deals.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-4">No deals found</td>
            </tr>
          ) : (
            deals.map((deal) => (
              <tr key={deal.id} className="hover:bg-gray-50">
                <td className="p-2 border">{deal.title}</td>
                <td className="p-2 border">${(deal.value ?? 0).toFixed(2)}</td>
                <td className="p-2 border">{deal.status}</td>
                <td className="p-2 border">{deal.company?.name ?? "-"}</td>
                <td className="p-2 border">{deal.contact ? `${deal.contact.firstName ?? ""} ${deal.contact.lastName ?? ""}` : "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="flex justify-between mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
