export async function fetchOrgFeatures(orgId: string) {
  const res = await fetch(`/api/org/${encodeURIComponent(orgId)}/features`);
  if (!res.ok) throw new Error(`Failed to fetch org features: ${res.status}`);
  return res.json();
}

export async function toggleFeature(orgId: string, feature: string, enabled: boolean) {
  const res = await fetch(`/api/org/${encodeURIComponent(orgId)}/features`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feature, enabled }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => null);
    throw new Error(`Failed to update feature: ${res.status} ${body || ''}`);
  }
  return res.json();
}
