export type Role = "TENANT" | "OWNER" | "VENDOR" | "MANAGER" | "ADMIN";

export type Permission = string;

export const permissions: Record<Role, Permission[]> = {
  TENANT: [
    "payments:read",
    "payments:create",
    "maintenance:create",
    "lease:read",
  ],
  OWNER: [
    "statements:read",
    "properties:read",
    "reports:read",
  ],
  VENDOR: [
    "workorders:read",
    "workorders:update",
  ],
  MANAGER: [
    "tenants:manage",
    "owners:manage",
    "maintenance:manage",
    "payments:manage",
    "reports:read",
  ],
  ADMIN: [
    "*",
  ],
};

export function normalizeRole(input?: string): Role {
  const r = (input || '').toLowerCase();
  if (r.includes('tenant')) return 'TENANT';
  if (r.includes('owner')) return 'OWNER';
  if (r.includes('vendor') || r.includes('service')) return 'VENDOR';
  if (r.includes('manager')) return 'MANAGER';
  if (r.includes('admin')) return 'ADMIN';
  return 'TENANT';
}
