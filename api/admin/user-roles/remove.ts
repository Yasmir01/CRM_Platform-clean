import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../../src/utils/authz';
import { prisma } from '../../_db';
import { safeParse } from '../../../src/utils/safeJson';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const admin = getUserOr401(req, res);
  if (!admin) return;
  if (!String((admin as any).role || '').toLowerCase().includes('super')) return res.status(403).json({ error: 'forbidden' });

  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    const body = typeof req.body === 'string' ? safeParse(req.body, {}) : (req.body || {});
    const userId = String(body.userId || '').trim();
    const roleId = String(body.roleId || '').trim();
    if (!userId || !roleId) return res.status(400).json({ error: 'Missing fields' });

    const ur = await prisma.userRole.findFirst({ where: { userId, roleId } });
    if (ur) await prisma.userRole.delete({ where: { id: ur.id } });

    // reset user's role & permissions to default 'Subscriber'
    try {
      await prisma.user.update({ where: { id: userId }, data: { role: 'Subscriber', permissions: null } as any });
    } catch (e) {}

    return res.status(200).json({ success: true });
  } catch (e: any) {
    console.error('admin/user-roles/remove error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
