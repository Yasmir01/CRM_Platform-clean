import { AccountingProvider } from "../types";

const TOKEN_URL = "https://api.freshbooks.com/auth/oauth/token";
const API_BASE = "https://api.freshbooks.com/accounting";

export const freshbooksProvider: AccountingProvider = {
  name: "freshbooks",

  getAuthorizeUrl(orgId) {
    const params = new URLSearchParams({
      client_id: process.env.FB_CLIENT_ID || "",
      response_type: "code",
      redirect_uri: process.env.FB_REDIRECT_URI || "",
      scope: "user:profile accounting:read accounting:write",
      state: `org:${orgId}`,
    });
    return `https://my.freshbooks.com/service/auth/oauth/authorize?${params.toString()}`;
  },

  async exchangeCode(code) {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: process.env.FB_CLIENT_ID || "",
      client_secret: process.env.FB_CLIENT_SECRET || "",
      redirect_uri: process.env.FB_REDIRECT_URI || "",
    });
    const res = await fetch(TOKEN_URL, { method: "POST", body });
    const data = await res.json();
    const expiresAt = new Date(Date.now() + (data.expires_in || 0) * 1000);
    return { accessToken: data.access_token, refreshToken: data.refresh_token, expiresAt };
  },

  async refresh(tokens) {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tokens.refreshToken,
      client_id: process.env.FB_CLIENT_ID || "",
      client_secret: process.env.FB_CLIENT_SECRET || "",
      redirect_uri: process.env.FB_REDIRECT_URI || "",
    });
    const res = await fetch(TOKEN_URL, { method: "POST", body });
    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? tokens.refreshToken,
      expiresAt: new Date(Date.now() + (data.expires_in || 0) * 1000),
      realmId: tokens.realmId,
    };
  },

  async listAccounts(tokens) {
    const businessId = tokens.realmId!;
    const res = await fetch(`${API_BASE}/account/${businessId}/accounts/accounts`, {
      headers: { Authorization: `Bearer ${tokens.accessToken}`, "Content-Type": "application/json" },
    });
    const data = await res.json();
    const list = data?.response?.result?.accounts || [];
    return list.map((a: any) => ({ id: a.id?.toString(), name: a.name, type: a.type }));
  },

  async pushLedgerEntry(tokens, { amount, date, memo, accountId }) {
    const businessId = tokens.realmId!;
    const payload = {
      journal_entry: {
        date: date.slice(0,10),
        notes: memo ?? "CRM Ledger Entry",
        lines: [
          { accountid: accountId, amount: Math.abs(amount), debit: amount < 0 },
          { accountid: accountId, amount: Math.abs(amount), credit: amount > 0 },
        ],
      },
    } as const;
    const res = await fetch(`${API_BASE}/account/${businessId}/journal_entries/journal_entries`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokens.accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    const id = data?.response?.result?.journal_entry?.id?.toString() ?? `fb-${Date.now()}`;
    return { externalId: id };
  },
};
