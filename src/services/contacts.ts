import { prisma } from '@/lib/prisma';

export type ContactCreate = {
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
  companyId?: string | null;
  ownerId?: string | null;
};

export async function listContacts(opts: { q?: string; companyId?: string; ownerId?: string; take?: number; skip?: number } = {}) {
  const { q, companyId, ownerId, take = 50, skip = 0 } = opts;
  const where: any = { archived: false };
  if (companyId) where.companyId = companyId;
  if (ownerId) where.ownerId = ownerId;
  if (q) {
    const qLower = q.toLowerCase();
    where.OR = [
      { firstName: { contains: qLower, mode: 'insensitive' } },
      { lastName: { contains: qLower, mode: 'insensitive' } },
      { email: { contains: qLower, mode: 'insensitive' } },
      { phone: { contains: qLower, mode: 'insensitive' } },
    ];
  }
  return prisma.contact.findMany({ where, take, skip, orderBy: { updatedAt: 'desc' }, include: { company: true } });
}

export async function getContactById(id: string) {
  return prisma.contact.findUnique({ where: { id }, include: { company: true, notes: { orderBy: { createdAt: 'desc' } } } });
}

export async function createContact(data: ContactCreate) {
  return prisma.contact.create({ data });
}

export async function updateContact(id: string, data: Partial<ContactCreate>) {
  return prisma.contact.update({ where: { id }, data });
}

export async function archiveContact(id: string) {
  return prisma.contact.update({ where: { id }, data: { archived: true } });
}
