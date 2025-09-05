import { withValidToken } from "./tokenService";
import { logSyncEvent } from "./logService";
import { persistQuickBooksEntity } from "./mapper/quickbooksMapper";
import { withValidToken } from "./tokenService";

export async function fetchQuickBooksEntity(orgId: string, realmId: string, entityType: string, entityId: string) {
  const headers = await withValidToken("quickbooks", orgId);
  headers["Accept"] = "application/json";

  const path = `${entityType}`.toLowerCase();
  const url = `https://quickbooks.api.intuit.com/v3/company/${encodeURIComponent(realmId)}/${encodeURIComponent(path)}/${encodeURIComponent(entityId)}`;

  const res = await fetch(url, { headers });
  const json = await res.json().catch(() => ({}));

  // Extract the entity payload from QB response
  const payload = json?.[capitalize(path)]?.[0] || json?.[capitalize(path)] || json;
  if (payload) {
    await persistQuickBooksEntity(orgId, path, payload);
  }

  await logSyncEvent({ orgId, provider: "quickbooks", source: "webhook", data: { entityType, entityId, response: json }, status: res.ok ? "success" : "failed", entity: path, message: res.ok ? undefined : `HTTP ${res.status}` });
  return json;
}

function capitalize(s: string) {
  return s && s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
