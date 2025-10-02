import { prisma } from "@/lib/prisma";
import { ensureValidToken } from "@/lib/accounting/ensureToken";

export async function refreshAllExpiringTokens(): Promise<void> {
  const soon = new Date(Date.now() + 5 * 60 * 1000);
  const rows = await prisma.accountingConnection.findMany({
    where: { expiresAt: { lte: soon }, enabled: true },
  });

  for (const row of rows) {
    try {
      await ensureValidToken(row.orgId, row.provider as any);
      console.log(`refreshed token for ${row.provider} (org ${row.orgId})`);
    } catch (err) {
      console.error(`token refresh failed for ${row.provider} (org ${row.orgId})`, err);
    }
  }
}
