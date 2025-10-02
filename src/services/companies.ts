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
}
