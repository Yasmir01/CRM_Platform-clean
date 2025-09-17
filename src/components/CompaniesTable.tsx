// src/components/CompaniesTable.tsx
import React, { useEffect, useState } from "react";
import { fetchCompanies } from "../services/companies";

type Company = {
  id: string;
  name: string;
  industry?: string | null;
  createdAt?: string;
  updatedAt?: string;
  organization?: { id: string; name: string } | null;
  contacts?: { id: string; name?: string; email?: string }[];
};

export default function CompaniesTable() {
  const [data, setData] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState("createdAt:desc");
  const [search, setSearch] = useState("");

  async function load() {
    try {
      setLoading(true);
      const result = await fetchCompanies({ page, pageSize, sort, search });
      setData(result.data);
      setTotal(result.total);
    } catch (err) {
      console.error(err);
      alert("Failed to load companies");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, sort]);

  const pageCount = Math.ceil(total / pageSize);

  return (
    <div style={{ padding: 12 }}>
      <h2>Companies</h2>

      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
        <input
          placeholder="Search company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); load(); } }}
        />
        <button onClick={() => { setPage(1); load(); }}>Search</button>

        <label style={{ marginLeft: "auto" }}>
          Page size:
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </label>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
              <button onClick={() => setSort(sort === "name:asc" ? "name:desc" : "name:asc")}>Name</button>
            </th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
              <button onClick={() => setSort(sort === "industry:asc" ? "industry:desc" : "industry:asc")}>Industry</button>
            </th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Organization</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Contacts</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Created</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={5}>Loading...</td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={5}>No companies</td></tr>
          ) : data.map((c) => (
            <tr key={c.id}>
              <td style={{ padding: "8px 4px" }}>{c.name}</td>
              <td>{c.industry ?? "-"}</td>
              <td>{c.organization?.name ?? "-"}</td>
              <td>{(c.contacts || []).map((t) => t.name ?? t.email ?? "—").join(", ")}</td>
              <td>{c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={() => setPage(1)} disabled={page === 1}>First</button>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
        <span>Page {page} / {pageCount || 1}</span>
        <button onClick={() => setPage((p) => Math.min(pageCount || 1, p + 1))} disabled={page >= pageCount}>Next</button>
        <button onClick={() => setPage(pageCount || 1)} disabled={page >= pageCount}>Last</button>

        <div style={{ marginLeft: "auto" }}>
          <small>{total} companies</small>
        </div>
      </div>
    </div>
  );
}
