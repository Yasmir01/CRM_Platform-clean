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
