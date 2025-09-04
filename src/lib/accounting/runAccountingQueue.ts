import { prisma } from "@/lib/prisma";
import { ensureValidToken } from "./ensureToken";
import { getProvider } from "./factory";

export async function runAccountingQueue() {
  const jobs = await prisma.syncQueue.findMany({
    where: { notBefore: { lte: new Date() } },
    orderBy: { createdAt: "asc" },
    take: 25,
  });

  for (const j of jobs) {
    try {
      const tokens = await ensureValidToken(j.orgId, j.provider as any);
      const provider = getProvider(j.provider as any);
      const payload = j.payload as any;

      if (j.task === "push_ledger_entry") {
        await provider.pushLedgerEntry(tokens, payload);
      } else if (j.task === "pull_accounts") {
        await provider.listAccounts(tokens);
      }

      await prisma.syncQueue.delete({ where: { id: j.id }});
      await prisma.accountingSyncLog.create({
        data: { orgId: j.orgId, provider: j.provider, direction: "push", entity: j.task, payload: j.payload, status: "success" },
      });
    } catch (e: any) {
      const retries = j.retries + 1;
      const delay = Math.min(2 ** retries * 1000, 15 * 60 * 1000);
      await prisma.syncQueue.update({ where: { id: j.id }, data: { retries, notBefore: new Date(Date.now() + delay) } });
      await prisma.accountingSyncLog.create({
        data: { orgId: j.orgId, provider: j.provider, direction: "push", entity: j.task, payload: j.payload, status: "failed", message: e?.message ?? "error" },
      });
    }
  }
}
