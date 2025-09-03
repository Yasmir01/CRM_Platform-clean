export type Role = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "OWNER" | "VENDOR" | "TENANT";

export type Permission = string;

export const permissions: Record<Role, Permission[]> = {
  SUPER_ADMIN: ["*"],
  ADMIN: ["users:manage", "reports:read", "payments:manage", "maintenance:manage"],
  MANAGER: ["tenants:manage", "owners:manage", "maintenance:manage", "reports:read"],
  OWNER: ["statements:read", "properties:read", "reports:read"],
  VENDOR: ["workorders:read", "workorders:update"],
  TENANT: ["payments:read", "payments:create", "maintenance:create", "lease:read"],
};

export function normalizeRole(input?: string): Role {
  const r = (input || '').toLowerCase();
  if (r.includes('super')) return 'SUPER_ADMIN';
  if (r.includes('admin')) return 'ADMIN';
  if (r.includes('manager')) return 'MANAGER';
  if (r.includes('owner')) return 'OWNER';
  if (r.includes('vendor') || r.includes('service')) return 'VENDOR';
  if (r.includes('tenant')) return 'TENANT';
  return 'TENANT';
}
