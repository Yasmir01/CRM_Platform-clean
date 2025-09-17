// src/services/companies.ts
export type CompaniesQuery = {
  page?: number;
  pageSize?: number;
  sort?: string; // e.g., "name:asc"
  search?: string;
};

export async function fetchCompanies(q: CompaniesQuery = {}) {
  const params = new URLSearchParams();
  if (q.page) params.set("page", String(q.page));
  if (q.pageSize) params.set("pageSize", String(q.pageSize));
  if (q.sort) params.set("sort", q.sort);
  if (q.search) params.set("search", q.search);

  const res = await fetch(`/api/companies?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch companies");
  return res.json();
}

export async function updateCompany(id: string, updates: Record<string, any>) {
  const res = await fetch(`/api/companies`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...updates }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to update company");
  }
  return res.json();
}

export async function deleteCompany(id: string) {
  const res = await fetch(`/api/companies`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (res.status === 204) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to delete company");
  }
  return res.json();
}
