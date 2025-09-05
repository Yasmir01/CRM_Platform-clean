import { prisma } from "@/lib/prisma";
import { prisma } from "@/lib/prisma";
import { getProvider } from "@/lib/accounting/factory";
import { getTokens, saveTokens } from "@/lib/accounting/store";
import type { ProviderName } from "@/lib/accounting/types";

function normalizeProvider(p: string): ProviderName {
  const v = p.toLowerCase();
  if (v === "qb" || v === "quickbooksonline" || v === "quickbooks") return "quickbooks";
  if (v === "xero") return "xero";
  if (v === "wave") return "wave";
  if (v === "freshbooks" || v === "freshbook") return "freshbooks";
  throw new Error("Unsupported provider");
}

export async function refreshAccessToken(provider: string, orgId: string): Promise<string> {
  const prov = normalizeProvider(provider);
  const conn = await prisma.accountingConnection.findUnique({
    where: { orgId_provider: { orgId, provider: prov } },
  });
  if (!conn) throw new Error("Integration not found");

  if (conn.expiresAt.getTime() > Date.now()) {
    return conn.accessToken;
  }

  const tokens = await getTokens(orgId, prov);
  if (!tokens) throw new Error("No tokens stored");

  const p = getProvider(prov);
  const refreshed = await p.refresh(tokens);
  await saveTokens(orgId, prov, refreshed);

  return refreshed.accessToken;
}

export async function withValidToken(provider: string, orgId: string): Promise<Record<string, string>> {
  const token = await refreshAccessToken(provider, orgId);
  return { Authorization: `Bearer ${token}` };
}
