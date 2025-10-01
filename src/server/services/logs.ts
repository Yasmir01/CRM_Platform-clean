import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function recordComplianceLog({
  actor,
  action,
  entity,
}: {
  actor: string;
  action: string;
  entity: string;
}) {
  const message = `${actor} ${action} (${entity})`;
  return prisma.globalLog.create({
    data: {
      message,
      createdAt: new Date(),
    },
  });
}

export async function getComplianceLogs(limit = 50) {
  return prisma.globalLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
