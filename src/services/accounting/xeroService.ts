import { withValidToken } from "./tokenService";
import { logSyncEvent } from "./logService";
import { persistXeroEntity } from "./mapper/xeroMapper";

export async function fetchXeroEntity(orgId: string, tenantId: string, resourceType: string, resourceId: string) {
  const headers: Record<string, string> = await withValidToken("xero", orgId);
  headers["Xero-tenant-id"] = tenantId;
  headers["Accept"] = "application/json";

  const base = `https://api.xero.com/api.xro/2.0/${encodeURIComponent(resourceType)}/${encodeURIComponent(resourceId)}`;
  const res = await fetch(base, { headers });
  const json = await res.json().catch(() => ({}));

  // Extract the first entity payload from Xero response
  const key = normalizePlural(resourceType);
  const payload = json?.[capitalize(key)]?.[0] || json?.[capitalize(key)] || json;
  if (payload) {
    await persistXeroEntity(orgId, key, payload);
  }

  await logSyncEvent({ orgId, provider: "xero", source: "webhook", data: { resourceType, resourceId, response: json }, status: res.ok ? "success" : "failed", entity: resourceType.toLowerCase(), message: res.ok ? undefined : `HTTP ${res.status}` });
  return json;
}

function capitalize(s: string) {
  return s && s.length ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function normalizePlural(s: string) {
  const v = String(s || '').toLowerCase();
  if (v.endsWith('s')) return v;
  return v + 's';
}
