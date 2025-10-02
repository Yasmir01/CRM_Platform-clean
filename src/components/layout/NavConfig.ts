export type Role = "TENANT" | "OWNER" | "VENDOR" | "MANAGER" | "ADMIN";

export type NavItem = { label: string; href: string };

export const navConfig: Record<Role, NavItem[]> = {
  TENANT: [
    { label: "Dashboard", href: "/tenant" },
    { label: "Payments", href: "/tenant/payments" },
    { label: "Maintenance", href: "/tenant/maintenance" },
    { label: "Lease", href: "/tenant/lease" },
  ],
  OWNER: [
    { label: "Dashboard", href: "/owner" },
    { label: "Statements", href: "/owner/statements" },
    { label: "Properties", href: "/owner/properties" },
  ],
  VENDOR: [
    { label: "Dashboard", href: "/vendor" },
    { label: "Work Orders", href: "/vendor/work-orders" },
    { label: "Profile", href: "/vendor/profile" },
  ],
  MANAGER: [
    { label: "Dashboard", href: "/manager" },
    { label: "Tenants", href: "/manager/tenants" },
    { label: "Owners", href: "/manager/owners" },
    { label: "Maintenance", href: "/manager/maintenance" },
  ],
  ADMIN: [
    { label: "Dashboard", href: "/admin" },
    { label: "Users", href: "/admin/users" },
    { label: "System Logs", href: "/admin/logs" },
  ],
};

export function normalizeRole(input?: string): Role {
  const r = (input || '').toLowerCase();
  if (r.includes('tenant')) return 'TENANT';
  if (r.includes('owner')) return 'OWNER';
  if (r.includes('service') || r.includes('vendor')) return 'VENDOR';
  if (r.includes('manager')) return 'MANAGER';
  if (r.includes('admin')) return 'ADMIN';
  return 'TENANT';
}
