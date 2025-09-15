import type { User } from "@prisma/client";

type PermissionMap = {
  [role: string]: string[];
};

// Define which actions each role can perform
const permissions: PermissionMap = {
  SUPER_ADMIN: ["*"], // full access
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
  PROPERTY_MANAGER: [
    "property:read",
    "tenant:read",
    "ticket:read",
    "ticket:write",
  ],
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

/**
 * Checks if a user has permission for an action.
 */
export function can(user: User | null | undefined, action: string): boolean {
  if (!user) return false;
  const role = (user as any).role as string;
  const allowed = permissions[role] || [];
  if (allowed.includes("*")) return true;
  return allowed.includes(action);
}
