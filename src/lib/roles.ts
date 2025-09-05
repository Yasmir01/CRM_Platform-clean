import { normalizeRole, Role as BaseRole } from './permissions';

export type Role = BaseRole;

function collectUserRoles(user: any): Role[] {
  const list: Role[] = [];
  if (user?.roles && Array.isArray(user.roles)) {
    for (const r of user.roles) list.push(normalizeRole(String(r)));
  }
  if (user?.role) list.push(normalizeRole(String(user.role)));
  return Array.from(new Set(list));
}

function allows(set: Set<Role>, required: Role): boolean {
  if (set.has('SUPER_ADMIN')) return true;
  switch (required) {
    case 'ADMIN':
      return set.has('ADMIN');
    case 'MANAGER':
      return set.has('MANAGER') || set.has('ADMIN');
    case 'OWNER':
      return set.has('OWNER') || set.has('ADMIN');
    case 'VENDOR':
      return set.has('VENDOR') || set.has('ADMIN');
    case 'TENANT':
      return set.has('TENANT') || set.has('ADMIN');
    default:
      return set.has(required);
  }
}

export function hasRole(user: any, allowed: Role[]): boolean {
  const roles = new Set<Role>(collectUserRoles(user));
  return allowed.some((r) => allows(roles, normalizeRole(String(r))));
}

export function requireRole(user: any, allowed: Role[]) {
  if (!hasRole(user, allowed)) {
    const err: any = new Error('forbidden');
    err.code = 403;
    throw err;
  }
}
