<<<<<<< HEAD
import { prisma } from '@/lib/prisma';

export type CompanyCreate = {
  name: string;
  domain?: string | null;
  industry?: string | null;
  size?: string | null;
};

export async function listCompanies(opts: { q?: string; industry?: string; size?: string; take?: number; skip?: number } = {}) {
  const { q, industry, size, take = 50, skip = 0 } = opts;
  const where: any = { archived: false };
  if (industry) where.industry = industry;
  if (size) where.size = size;
  if (q) {
    const qLower = q.toLowerCase();
    where.OR = [
      { name: { contains: qLower, mode: 'insensitive' } },
      { domain: { contains: qLower, mode: 'insensitive' } },
    ];
  }
  return prisma.company.findMany({ where, take, skip, orderBy: { updatedAt: 'desc' } });
}

export async function getCompanyById(id: string) {
  return prisma.company.findUnique({ where: { id }, include: { contacts: { where: { archived: false } } } });
}

export async function createCompany(data: CompanyCreate) {
  return prisma.company.create({ data });
}

export async function updateCompany(id: string, data: Partial<CompanyCreate>) {
  return prisma.company.update({ where: { id }, data });
}

export async function archiveCompany(id: string) {
  return prisma.company.update({ where: { id }, data: { archived: true } });
=======
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
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
}
