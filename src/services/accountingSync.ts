import { withValidToken } from "./accounting/tokenService";

// QUICKBOOKS
export async function syncQuickBooks(integrationId: string, companyId: string) {
  const headers = await withValidToken("quickbooks", integrationId);

  const accountsRes = await fetch(
    `https://quickbooks.api.intuit.com/v3/company/${companyId}/query?query=select * from Account`,
    { headers }
  );
  const accounts = await accountsRes.json();

  const invoicesRes = await fetch(
    `https://quickbooks.api.intuit.com/v3/company/${companyId}/query?query=select * from Invoice`,
    { headers }
  );
  const invoices = await invoicesRes.json();

  return {
    provider: "QuickBooks",
    accounts: accounts.QueryResponse?.Account?.length || 0,
    invoices: invoices.QueryResponse?.Invoice?.length || 0,
    syncedAt: new Date().toISOString(),
  } as const;
}

// XERO
export async function syncXero(integrationId: string, tenantId: string) {
  const headers: Record<string, string> = await withValidToken("xero", integrationId);
  headers["Xero-tenant-id"] = tenantId;

  const accountsRes = await fetch("https://api.xero.com/api.xro/2.0/Accounts", { headers });
  const accounts = await accountsRes.json();

  const invoicesRes = await fetch("https://api.xero.com/api.xro/2.0/Invoices", { headers });
  const invoices = await invoicesRes.json();

  return {
    provider: "Xero",
    accounts: accounts.Accounts?.length || 0,
    invoices: invoices.Invoices?.length || 0,
    syncedAt: new Date().toISOString(),
  } as const;
}

// WAVE
export async function syncWave(integrationId: string, businessId: string) {
  const headers: Record<string, string> = await withValidToken("wave", integrationId);
  headers["Content-Type"] = "application/json";

  const query = `
    query GetInvoices($businessId: ID!) {
      business(id: $businessId) {
        id
        name
        invoices {
          edges {
            node {
              id
              status
              total { value currency { code } }
            }
          }
        }
      }
    }
  `;

  const body = JSON.stringify({ query, variables: { businessId } });

  const res = await fetch("https://gql.waveapps.com/graphql/public", {
    method: "POST",
    headers,
    body,
  });

  const json = await res.json();
  const invoices = json?.data?.business?.invoices?.edges || [];

  return {
    provider: "Wave",
    invoices: invoices.length,
    syncedAt: new Date().toISOString(),
  } as const;
}
