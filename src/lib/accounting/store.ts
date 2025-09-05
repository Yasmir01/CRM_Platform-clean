import { prisma } from "@/lib/prisma";
import type { OAuthTokens } from "./types";

export async function saveTokens(orgId: string, provider: string, tokens: OAuthTokens) {
  await prisma.accountingConnection.upsert({
    where: { orgId_provider: { orgId, provider } },
    update: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      realmId: tokens.realmId ?? null,
      enabled: true,
    },
    create: {
      orgId,
      provider,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      realmId: tokens.realmId ?? null,
      enabled: true,
    },
  });
}

export async function getTokens(orgId: string, provider: string): Promise<OAuthTokens | null> {
  const rec = await prisma.accountingConnection.findUnique({
    where: { orgId_provider: { orgId, provider } },
  });
  if (!rec) return null;
  return {
    accessToken: rec.accessToken,
    refreshToken: rec.refreshToken,
    expiresAt: rec.expiresAt,
    realmId: rec.realmId ?? undefined,
  };
}
