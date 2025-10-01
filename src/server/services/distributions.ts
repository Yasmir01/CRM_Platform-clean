import { PrismaClient, DistributionStatus } from "@prisma/client";
import { recordComplianceLog } from "../utils/compliance";

const prisma = new PrismaClient();

export async function createDistribution({
  ownerId,
  statementId,
  amount,
  method,
  actorId,
}: {
  ownerId: string;
  statementId?: string;
  amount: number;
  method: string;
  actorId: string;
}) {
  const dist = await prisma.ownerDistribution.create({
    data: { ownerId, statementId, amount: amount.toFixed(2), method },
  });

  await recordComplianceLog({
    actor: actorId,
    action: "CreateDistribution",
    entity: `Distribution:${dist.id}`,
    details: `Method=${method}, Amount=${amount}`,
  });

  return dist;
}

export async function markDistributionPaid(distributionId: string, actorId: string) {
  const dist = await prisma.ownerDistribution.update({
    where: { id: distributionId },
    data: { status: DistributionStatus.PAID, paidAt: new Date() },
  });

  await recordComplianceLog({
    actor: actorId,
    action: "MarkPaid",
    entity: `Distribution:${distributionId}`,
    details: `Marked as PAID`,
  });

  return dist;
}

export async function listDistributions(ownerId: string) {
  return prisma.ownerDistribution.findMany({
    where: { ownerId },
    include: { statement: true },
    orderBy: { createdAt: "desc" },
  });
}
