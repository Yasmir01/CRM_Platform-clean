import { prisma } from "@/lib/prisma";

export async function userHasAccessToProperty(userId: string, propertyId: string) {
  const assignment = await prisma.propertyAssignment.findFirst({ where: { userId, propertyId } });
  return !!assignment;
}
