import { prisma } from '@/lib/prisma';

export async function getOrgSettings(orgId: string) {
  return prisma.orgSettings.findUnique({ where: { orgId } });
}

export async function updateOrgSettings(orgId: string, data: { notifications?: boolean }) {
  return prisma.orgSettings.upsert({
    where: { orgId },
    update: { ...data },
    create: { orgId, ...data },
  });
}
