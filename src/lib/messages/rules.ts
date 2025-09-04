export function normalizeRoleString(role: string): 'tenant' | 'manager' | 'owner' | 'admin' | 'superadmin' | 'vendor' | 'unknown' {
  const r = String(role || '').toLowerCase();
  if (r === 'super_admin' || r === 'superadmin' || r === 'su') return 'superadmin';
  if (r === 'admin') return 'admin';
  if (r === 'manager') return 'manager';
  if (r === 'owner') return 'owner';
  if (r === 'tenant') return 'tenant';
  if (r === 'vendor') return 'vendor';
  return 'unknown';
}

export function canMessage(senderRole: string, recipientRole: string): boolean {
  const s = normalizeRoleString(senderRole);
  const r = normalizeRoleString(recipientRole);

  const rules: Record<string, string[]> = {
    tenant: ['manager'],
    manager: ['tenant', 'owner', 'admin'],
    owner: ['manager', 'admin'],
    admin: ['manager', 'owner', 'superadmin'],
    superadmin: ['tenant', 'manager', 'owner', 'admin', 'superadmin', 'vendor'],
  };

  const allowed = rules[s] || [];
  return allowed.includes(r);
}
