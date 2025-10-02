import { prisma } from "@/lib/prisma";

export async function logSyncEvent(params: {
  orgId: string | null;
  provider: string;
  source: "webhook" | "manual" | "auto";
  data: any;
  status?: "received" | "success" | "failed" | "pending" | string;
  entity?: string;
  message?: string | null;
}) {
  const { orgId, provider, source, data, status = "received", entity = "webhook_event", message = null } = params;
  const direction = source === "webhook" ? "pull" : "push";
  const resolvedOrgId = orgId || "unmapped";
  return prisma.accountingSyncLog.create({
    data: {
      orgId: resolvedOrgId,
      provider,
      direction,
      entity,
      payload: data,
      status,
      message: message || undefined,
    },
  });
}
