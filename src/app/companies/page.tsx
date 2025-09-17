"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface Company {
  id: string;
  name: string;
  industry?: string | null;
  website?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [total, setTotal] = useState(0);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      params.set("sort", `${sortField}:${sortOrder}`);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/companies?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load companies");
      const json = await res.json();
      // API may return { items, total } or { data, total }
      const items = json.items ?? json.data ?? json;
      const totalCount = json.total ?? json.count ?? (Array.isArray(items) ? items.length : 0);
      setCompanies(items);
      setTotal(totalCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, sortField, sortOrder]);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Companies</h1>

        <div style={{ display: "flex", gap: 8, marginLeft: "auto", alignItems: "center" }}>
          <Input
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
            placeholder="Search companies..."
            onKeyDown={(e) => { if (e.key === "Enter") { setPage(1); load(); } }}
            style={{ width: 260 }}
          />
          <Button onClick={() => { setPage(1); load(); }}>Search</Button>

          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            Page size:
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger style={{ minWidth: 80 }}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button variant="ghost" onClick={() => { setSortField("name"); setSortOrder((o) => o === "asc" ? "desc" : "asc"); }}>
                Name
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => { setSortField("industry"); setSortOrder((o) => o === "asc" ? "desc" : "asc"); }}>
                Industry
              </Button>
            </TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>
          ) : companies.length === 0 ? (
            <TableRow><TableCell colSpan={4}>No companies</TableCell></TableRow>
          ) : companies.map((c) => (
            <TableRow key={c.id}>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.industry ?? "-"}</TableCell>
              <TableCell>{c.website ?? "-"}</TableCell>
              <TableCell>{c.createdAt ? new Date(c.createdAt).toLocaleString() : "-"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
        <Button onClick={() => setPage(1)} disabled={page === 1}>First</Button>
        <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
        <div>Page {page} / {pageCount}</div>
        <Button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page >= pageCount}>Next</Button>
        <Button onClick={() => setPage(pageCount)} disabled={page >= pageCount}>Last</Button>

        <div style={{ marginLeft: "auto" }}>
          <small>{total} companies</small>
        </div>
      </div>
    </div>
  );
}
