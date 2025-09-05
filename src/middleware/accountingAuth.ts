import { refreshAccessToken } from "@/services/accounting/tokenService";

export async function withValidToken(provider: string, orgId: string): Promise<Record<string, string>> {
  const token = await refreshAccessToken(provider, orgId);
  return { Authorization: `Bearer ${token}` };
}
