import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensurePermission } from '../../src/lib/authorize';
import { prisma } from '../_db';
import { notify } from '../../src/lib/notify';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const auth = ensurePermission(req, res, 'maintenance:create');
  if (!auth) return;

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const { title, description, priority, propertyId, unitId, s3Key, category } = body as {
    title?: string; description?: string; priority?: string; propertyId?: string; unitId?: string; s3Key?: string | null; category?: string;
  };
  if (!description) return res.status(400).json({ error: 'missing description' });
  const finalTitle = title && title.trim().length ? title : `Maintenance: ${String(category || 'general')}`;

  const tenantId = String((auth as any).sub || (auth as any).id);
  const user = await prisma.user.findUnique({ where: { id: tenantId } });
  const orgId = user?.orgId || null;

  const reqRec = await prisma.maintenanceRequest.create({
    data: {
      tenantId,
      orgId: orgId || undefined,
      propertyId: propertyId || (await (async () => {
        // If propertyId not provided, try to infer from active lease
        try {
          const lease = await prisma.lease.findFirst({ where: { tenantId, status: 'ACTIVE' as any }, include: { unit: true } });
          return lease?.unit?.propertyId || undefined;
        } catch { return undefined; }
      })()),
      unitId: unitId || undefined,
      title: finalTitle,
      description,
      category: category || undefined,
      priority: priority || 'normal',
      // attachment key can be stored via a separate Document; for now keep in description/meta
    },
  });

  // Notify org admins/managers
  if (orgId) {
    const admins = await prisma.user.findMany({ where: { orgId, role: { in: ['ADMIN','MANAGER'] as any } }, select: { id: true, email: true } });
    for (const admin of admins) {
      await notify({
        userId: admin.id,
        email: admin.email || undefined,
        type: 'maintenance_request',
        title: 'New Maintenance Request',
        message: `${user?.email || 'Tenant'} submitted: ${title}`,
        meta: { requestId: reqRec.id },
      });
    }
  }

  return res.status(201).json(reqRec);
}
