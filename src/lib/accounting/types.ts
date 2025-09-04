export type ProviderName = "quickbooks" | "xero" | "freshbooks";

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date; // absolute
  realmId?: string;
}

export interface AccountingProvider {
  name: ProviderName;
  getAuthorizeUrl(orgId: string): string;
  exchangeCode(code: string, state: string): Promise<OAuthTokens>;
  refresh(tokens: OAuthTokens): Promise<OAuthTokens>;

  listAccounts(tokens: OAuthTokens): Promise<Array<{ id: string; name: string; type: string }>>;

  pushLedgerEntry(tokens: OAuthTokens, opts: {
    orgId: string;
    entryType: "rent_income" | "expense" | "fee" | "refund";
    amount: number;
    date: string; // ISO
    memo?: string;
    accountId: string; // mapped provider account
  }): Promise<{ externalId: string }>;
}
