"use client";

import React, { useEffect, useState } from "react";
import { Button, TextField, Card, CardHeader, CardContent, CardActions, CircularProgress } from "@mui/material";

type Company = {
  id: string;
  name: string;
  industry?: string | null;
  website?: string | null;
  createdAt?: string;
  contactCount?: number;
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", industry: "", website: "" });

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/companies");
      if (!res.ok) throw new Error("Failed to load");
      const json = await res.json();
      // API returns { data, hasMore, ... }
      setCompanies(json.data || []);
    } catch (err) {
      console.error("Error fetching companies:", err);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const addCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create");
      setForm({ name: "", industry: "", website: "" });
      await fetchCompanies();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Companies</h1>

      <Card className="max-w-md">
        <CardHeader title="Add Company" />
        <CardContent>
          <form onSubmit={addCompany} className="space-y-3">
            <TextField
              fullWidth
              required
              label="Company name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Industry"
              value={form.industry}
              onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Website"
              value={form.website}
              onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
            />
            <CardActions>
              <Button type="submit" variant="contained" color="primary">Add Company</Button>
            </CardActions>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Company List" />
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2"><CircularProgress size={20} /> <span>Loading...</span></div>
          ) : (
            <ul className="divide-y">
              {companies.map((c) => (
                <li key={c.id} className="py-3">
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-gray-600">{c.industry || '-'}</p>
                  {c.website && (
                    <a href={c.website} target="_blank" rel="noreferrer" className="text-blue-600 text-sm">{c.website}</a>
                  )}
                  <p className="text-sm text-gray-500">Contacts: {c.contactCount ?? 0}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
