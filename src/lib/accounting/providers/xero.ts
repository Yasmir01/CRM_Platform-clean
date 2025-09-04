import { AccountingProvider } from "../types";

const TOKEN_URL = "https://identity.xero.com/connect/token";
const API_BASE = "https://api.xero.com/api.xro/2.0";

export const xeroProvider: AccountingProvider = {
  name: "xero",

  getAuthorizeUrl(orgId) {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.XERO_CLIENT_ID || "",
      redirect_uri: process.env.XERO_REDIRECT_URI || "",
      scope: "openid profile email accounting.transactions accounting.settings",
      state: `org:${orgId}`,
    });
    return `https://login.xero.com/identity/connect/authorize?${params.toString()}`;
  },

  async exchangeCode(code) {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.XERO_REDIRECT_URI || "",
      client_id: process.env.XERO_CLIENT_ID || "",
      client_secret: process.env.XERO_CLIENT_SECRET || "",
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
      client_id: process.env.XERO_CLIENT_ID || "",
      client_secret: process.env.XERO_CLIENT_SECRET || "",
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
    const tenantId = tokens.realmId!;
    const res = await fetch(`${API_BASE}/Accounts`, {
      headers: { Authorization: `Bearer ${tokens.accessToken}`, "Xero-tenant-id": tenantId, Accept: "application/json" },
    });
    const data = await res.json();
    return (data.Accounts || []).map((a: any) => ({ id: a.AccountID, name: a.Name, type: a.Type }));
  },

  async pushLedgerEntry(tokens, { amount, date, memo, accountId }) {
    const tenantId = tokens.realmId!;
    const payload = {
      Journals: [{
        JournalDate: date.slice(0,10),
        JournalLines: [
          { AccountID: accountId, NetAmount: Math.abs(amount), Description: memo ?? "CRM Ledger Entry", Debit: amount < 0, Credit: amount > 0 },
          { AccountID: accountId, NetAmount: Math.abs(amount), Description: memo ?? "Balancing", Debit: amount > 0, Credit: amount < 0 },
        ]
      }]
    } as const;
    const res = await fetch(`${API_BASE}/Journals`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokens.accessToken}`, "Xero-tenant-id": tenantId, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    const id = data?.Journals?.[0]?.JournalID ?? `xero-${Date.now()}`;
    return { externalId: id };
  },
};
