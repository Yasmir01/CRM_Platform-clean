import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function recordComplianceLog({
  actor,
  action,
  entity,
  details,
  origin = "server",
}: {
  actor: string;
  action: string;
  entity: string;
  details?: string;
  origin?: "server" | "offline-sync";
}) {
  return prisma.complianceLog.create({
    data: { actor, action, entity, details, origin },
  });
}
