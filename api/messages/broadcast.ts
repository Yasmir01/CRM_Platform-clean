import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';
import { getUserOr401 } from '../../src/utils/authz';
import { notify } from '../../src/lib/notify';

function isAdminLike(user: any) {
  const rolesArr = Array.isArray(user?.roles) ? user.roles.map((r: string) => String(r).toLowerCase()) : [];
  const role = user?.role ? String(user.role).toLowerCase() : '';
  return rolesArr.includes('admin') || rolesArr.includes('superadmin') || role === 'admin' || role === 'super_admin';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const user = getUserOr401(req, res);
  if (!user) return;
  if (!isAdminLike(user)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const senderId = String((user as any).sub || (user as any).id);
    const rawRole = body.targetRole ? String(body.targetRole) : '';
    const targetRole = rawRole ? rawRole.trim().toUpperCase() : '';
    const rawPropertyId = body.propertyId ? String(body.propertyId) : '';
    const propertyId = rawPropertyId.trim() || '';
    const content = String(body.content || '').trim();

    if (!content) return res.status(400).json({ error: 'Content is required' });

    // Build base recipient query
    const where: any = {};
    if (targetRole) where.role = targetRole as any; // Prisma enum Role

    // Fetch recipients
    let recipients = await prisma.user.findMany({ where, select: { id: true } });

    // Optional property-specific narrowing for owners using OwnerLedger
    if (propertyId && targetRole === 'OWNER') {
      const owners = await prisma.ownerLedger.findMany({
        where: { propertyId },
        select: { ownerId: true },
        distinct: ['ownerId'],
      });
      const ownerIds = new Set(owners.map((o) => o.ownerId));
      recipients = recipients.filter((r) => ownerIds.has(r.id));
    }

    // Exclude sender if present
    recipients = recipients.filter((r) => r.id !== senderId);

    if (recipients.length === 0) {
      return res.status(200).json({ success: true, count: 0 });
    }

    // Create messages in a transaction
    const created = await prisma.$transaction(
      recipients.map((r) =>
        prisma.directMessage.create({
          data: {
            senderId,
            receiverId: r.id,
            propertyId: propertyId || undefined,
            content,
          },
        })
      )
    );

    // Fire notifications (best-effort)
    for (const r of recipients) {
      await notify({
        userId: r.id,
        type: 'new_message',
        title: 'Broadcast Message',
        message: content,
        meta: { link: '/crm/messages' },
      });
    }

    return res.status(200).json({ success: true, count: created.length });
  } catch (e: any) {
    console.error('broadcast error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
