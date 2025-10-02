import { AccountingProvider } from "../types";

const QB_AUTH = "https://appcenter.intuit.com/connect/oauth2";
const QB_TOKEN = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
const QB_API_BASE = (env: string) =>
  env === "production" ? "https://quickbooks.api.intuit.com" : "https://sandbox-quickbooks.api.intuit.com";

export const quickbooksProvider: AccountingProvider = {
  name: "quickbooks",

  getAuthorizeUrl(orgId) {
    const params = new URLSearchParams({
      client_id: process.env.QB_CLIENT_ID || "",
      redirect_uri: process.env.QB_REDIRECT_URI || "",
      response_type: "code",
      scope: "com.intuit.quickbooks.accounting openid profile email",
      state: `org:${orgId}`,
    });
    return `${QB_AUTH}?${params.toString()}`;
  },

  async exchangeCode(code, state) {
    const basic = Buffer.from(`${process.env.QB_CLIENT_ID || ""}:${process.env.QB_CLIENT_SECRET || ""}`).toString("base64");
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.QB_REDIRECT_URI || "",
    });

    const res = await fetch(QB_TOKEN, {
      method: "POST",
      headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await res.json();

    const expiresAt = new Date(Date.now() + (data.expires_in || 0) * 1000);
    const urlRealm = new URLSearchParams(state).get("realmId") || undefined;
    return { accessToken: data.access_token, refreshToken: data.refresh_token, expiresAt, realmId: urlRealm };
  },

  async refresh(tokens) {
    const basic = Buffer.from(`${process.env.QB_CLIENT_ID || ""}:${process.env.QB_CLIENT_SECRET || ""}`).toString("base64");
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: tokens.refreshToken,
    });
    const res = await fetch(QB_TOKEN, {
      method: "POST",
      headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await res.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? tokens.refreshToken,
      expiresAt: new Date(Date.now() + (data.expires_in || 0) * 1000),
      realmId: tokens.realmId,
    };
  },

  async listAccounts(tokens) {
    const env = process.env.QB_ENV || "sandbox";
    const q = "select * from Account";
    const res = await fetch(`${QB_API_BASE(env)}/v3/company/${tokens.realmId}/query?query=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${tokens.accessToken}`, Accept: "application/json" },
    });
    const data = await res.json();
    return (data.QueryResponse?.Account || []).map((a: any) => ({
      id: a.Id, name: a.Name, type: a.AccountType,
    }));
  },

  async pushLedgerEntry(tokens, { amount, date, memo, accountId }) {
    const env = process.env.QB_ENV || "sandbox";
    const payload = {
      Line: [
        { DetailType: "JournalEntryLineDetail", Amount: Math.abs(amount),
          JournalEntryLineDetail: { PostingType: amount >= 0 ? "Credit" : "Debit", AccountRef: { value: accountId } },
          Description: memo ?? "CRM Ledger Entry" },
        { DetailType: "JournalEntryLineDetail", Amount: Math.abs(amount),
          JournalEntryLineDetail: { PostingType: amount >= 0 ? "Debit" : "Credit", AccountRef: { value: accountId } },
          Description: memo ?? "Balancing line" },
      ],
      TxnDate: date.slice(0,10),
    } as const;
    const res = await fetch(`${QB_API_BASE(env)}/v3/company/${tokens.realmId}/journalentry`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    const id = data?.JournalEntry?.Id ?? `qb-${Date.now()}`;
    return { externalId: id };
  },
};
