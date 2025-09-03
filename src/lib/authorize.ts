import type { VercelRequest, VercelResponse } from '@vercel/node';
import { permissions, Role, normalizeRole } from './permissions';
import { getUserOr401 } from '../utils/authz';

export function userHasPermissions(user: any, needed: string | string[]): boolean {
  if (!user) return false;
  const role: Role = normalizeRole(user.role || (Array.isArray(user.roles) ? user.roles[0] : 'TENANT'));
  const required = Array.isArray(needed) ? needed : [needed];

  // Per-user overrides via comma-separated permissions
  let perms: string[] | null = null;
  if (typeof user.permissions === 'string' && user.permissions.length > 0) {
    perms = user.permissions.split(',').map((p: string) => p.trim());
  }

  const effective = perms ?? (permissions[role] || []);
  if (effective.includes('*')) return true;
  return required.every((p) => effective.includes(p));
}

export function authorize(user: any, needed: string | string[]) {
  const ok = userHasPermissions(user, needed);
  return { ok } as { ok: boolean };
}

// Convenience: validates session via cookie, then enforces permission; responds with 401/403 on failure.
export function ensurePermission(req: VercelRequest, res: VercelResponse, needed: string | string[]) {
  const user = getUserOr401(req, res);
  if (!user) return null;
  if (!userHasPermissions(user, needed)) {
    res.status(403).json({ error: 'Forbidden' });
    return null;
  }
  return user;
}
