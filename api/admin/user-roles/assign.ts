import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../../src/utils/authz';
import { prisma } from '../../_db';
import { safeParse } from '../../../src/utils/safeJson';

function flattenPermissionsMap(map: any): string[] {
  // map: { module: { view: true, edit: false, delete: false } }
  const out: string[] = [];
  for (const [module, perms] of Object.entries(map || {})) {
    const p = perms as any;
    if (p.view) out.push(`${module}:view`);
    if (p.edit) out.push(`${module}:edit`);
    if (p.delete) out.push(`${module}:delete`);
  }
  return out;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = getUserOr401(req, res);
  if (!admin) return;
  if (!String((admin as any).role || '').toLowerCase().includes('super')) return res.status(403).json({ error: 'forbidden' });

  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const body = typeof req.body === 'string' ? safeParse(req.body, {}) : (req.body || {});
    const userId = String(body.userId || '').trim();
    const roleId = String(body.roleId || '').trim();
    const propertyId = body.propertyId ? String(body.propertyId) : undefined;
    if (!userId || !roleId) return res.status(400).json({ error: 'Missing fields' });

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) return res.status(404).json({ error: 'Role not found' });

    // create userRole
    const ur = await prisma.userRole.create({ data: { userId, roleId, propertyId: propertyId || undefined } });

    // update user's role string and permissions string
    const permsList = flattenPermissionsMap(role.permissions || {});
    try {
      await prisma.user.update({ where: { id: userId }, data: { role: role.name, permissions: permsList.join(',') } as any });
    } catch (e) {
      console.warn('Failed to update user role/permissions on user record', e);
    }

    return res.status(200).json(ur);
  } catch (e: any) {
    console.error('admin/user-roles/assign error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
