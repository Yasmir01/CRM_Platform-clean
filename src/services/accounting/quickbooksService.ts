import { withValidToken } from "./tokenService";
import { logSyncEvent } from "./logService";

export async function fetchQuickBooksEntity(orgId: string, realmId: string, entityType: string, entityId: string) {
  const headers = await withValidToken("quickbooks", orgId);
  headers["Accept"] = "application/json";

  const path = `${entityType}`.toLowerCase();
  const url = `https://quickbooks.api.intuit.com/v3/company/${encodeURIComponent(realmId)}/${encodeURIComponent(path)}/${encodeURIComponent(entityId)}`;

  const res = await fetch(url, { headers });
  const json = await res.json().catch(() => ({}));

  await logSyncEvent({ orgId, provider: "quickbooks", source: "webhook", data: { entityType, entityId, response: json }, status: res.ok ? "success" : "failed", entity: path, message: res.ok ? undefined : `HTTP ${res.status}` });
  return json;
}
