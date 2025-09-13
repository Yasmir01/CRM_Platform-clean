// Frontend permission checker (string-based to avoid coupling client bundle to Prisma types)

type PermissionMap = { [role: string]: string[] };

const permissions: PermissionMap = {
  SUPER_ADMIN: ["*"],
  COMPANY_ADMIN: [
    "company:read",
    "company:write",
    "property:read",
    "property:write",
    "tenant:read",
    "tenant:write",
    "owner:read",
    "owner:write",
    "invoice:read",
    "invoice:write",
    "payment:read",
    "payment:write",
    "ticket:read",
    "ticket:write",
  ],
  PROPERTY_MANAGER: ["property:read", "tenant:read", "ticket:read", "ticket:write"],
  ACCOUNTING: ["invoice:read", "invoice:write", "payment:read", "payment:write"],
  MAINTENANCE: ["ticket:read", "ticket:write"],
  OWNER: ["owner:read", "property:read", "tenant:read"],
  TENANT: ["tenant:read", "payment:read", "ticket:read"],
  AUDITOR: [
    "company:read",
    "property:read",
    "tenant:read",
    "owner:read",
    "invoice:read",
    "payment:read",
    "ticket:read",
  ],
};

export function canClient(role: string | undefined | null, action: string) {
  if (!role) return false;
  const allowed = permissions[String(role)] || [];
  if (allowed.includes("*")) return true;
  return allowed.includes(action);
}
