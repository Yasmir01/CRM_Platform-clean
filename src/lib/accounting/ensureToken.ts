import { getProvider } from "./factory";
import { getTokens, saveTokens } from "./store";
import { getProvider } from "./factory";

export async function ensureValidToken(orgId: string, providerName: "quickbooks"|"xero"|"freshbooks"|"wave") {
  const tokens = await getTokens(orgId, providerName);
  if (!tokens) throw new Error("No connection");
  if (tokens.expiresAt.getTime() - Date.now() > 60_000) return tokens;
  const provider = getProvider(providerName);
  const refreshed = await provider.refresh(tokens);
  await saveTokens(orgId, providerName, refreshed);
  return refreshed;
}
