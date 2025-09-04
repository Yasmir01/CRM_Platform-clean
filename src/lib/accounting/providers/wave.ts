import { AccountingProvider, OAuthTokens } from "../types";

const AUTH_URL = "https://api.waveapps.com/oauth2/authorize";
const TOKEN_URL = "https://api.waveapps.com/oauth2/token";
const GQL_URL = "https://gql.waveapps.com/graphql/public";

export const waveProvider: AccountingProvider = {
  name: "wave",

  getAuthorizeUrl(orgId: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.WAVE_CLIENT_ID || "",
      redirect_uri: process.env.WAVE_REDIRECT_URI || "",
      scope: "accounting",
      state: `org:${orgId}`,
    });
    return `${AUTH_URL}?${params.toString()}`;
  },

  async exchangeCode(code: string, state: string): Promise<OAuthTokens> {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: process.env.WAVE_CLIENT_ID || "",
      client_secret: process.env.WAVE_CLIENT_SECRET || "",
      redirect_uri: process.env.WAVE_REDIRECT_URI || "",
    });
    const res = await fetch(TOKEN_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: params.toString() });
    if (!res.ok) throw new Error(`Wave token exchange failed: ${res.status}`);
    const data = await res.json();
    const expiresAt = new Date(Date.now() + (Number(data.expires_in || 1800) * 1000));
    return { accessToken: data.access_token, refreshToken: data.refresh_token || "", expiresAt };
  },

  async refresh(tokens: OAuthTokens): Promise<OAuthTokens> {
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tokens.refreshToken,
      client_id: process.env.WAVE_CLIENT_ID || "",
      client_secret: process.env.WAVE_CLIENT_SECRET || "",
    });
    const res = await fetch(TOKEN_URL, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: params.toString() });
    if (!res.ok) throw new Error(`Wave refresh failed: ${res.status}`);
    const data = await res.json();
    const expiresAt = new Date(Date.now() + (Number(data.expires_in || 1800) * 1000));
    return { accessToken: data.access_token, refreshToken: data.refresh_token || tokens.refreshToken, expiresAt };
  },

  async listAccounts(tokens: OAuthTokens): Promise<Array<{ id: string; name: string; type: string }>> {
    // Wave GraphQL: list businesses as pseudo-accounts for selection context
    const query = `query { businesses { id name } }`;
    const res = await fetch(GQL_URL, { method: "POST", headers: { Authorization: `Bearer ${tokens.accessToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
    if (!res.ok) return [];
    const json = await res.json();
    const businesses = json?.data?.businesses ?? [];
    return businesses.map((b: any) => ({ id: String(b.id), name: String(b.name), type: "business" }));
  },

  async pushLedgerEntry(): Promise<{ externalId: string }> {
    throw new Error("Wave pushLedgerEntry is not supported");
  },
};
