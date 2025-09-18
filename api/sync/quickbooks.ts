import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../src/utils/authz';
import { prisma } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const user = getUserOr401(req, res);
  if (!user) return;

  try {
    const userId = String((user as any).sub || user.id || '');
    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!dbUser) return res.status(401).json({ error: 'Unauthorized' });

    // Only allow admins/landlords to trigger sync for their account
    const role = String((user as any).role || '').toLowerCase();
    if (!['admin', 'property manager', 'landlord', 'super_admin', 'superadmin'].includes(role) && !((user as any).roles || []).includes('admin')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const accountId = (dbUser as any).accountId || (dbUser as any).orgId || null;
    let propertyIds: string[] = [];
    if (accountId) {
      const props = await prisma.property.findMany({ where: { accountId: String(accountId) }, select: { id: true } });
      propertyIds = props.map((p) => p.id);
    }

    // Find unsynced payments/invoices (best-effort: look for `synced` flag; if none, return recent items)
    const payments = await prisma.rentPayment.findMany({ where: propertyIds.length ? { propertyId: { in: propertyIds } } : {}, orderBy: { createdAt: 'desc' }, take: 200 });
    const invoices = await prisma.maintenanceInvoice.findMany({ where: propertyIds.length ? { propertyId: { in: propertyIds } } : {}, orderBy: { createdAt: 'desc' }, take: 200 }).catch(() => [] as any[]);

    // In production we would enqueue a job to sync to QuickBooks using OAuth tokens; here we just log
    const toSyncCount = (payments?.length || 0) + (invoices?.length || 0);

    // Log a quick sync event
    try {
      if ((prisma as any).stripeEvent) {
        await (prisma as any).stripeEvent.create({ data: { stripeId: `quickbooks-sync-${Date.now()}`, type: 'quickbooks.sync', data: { user: userId, count: toSyncCount } } }).catch(() => null);
      }
    } catch (e) {}

    return res.status(200).json({ message: 'Sync started (stub)', count: toSyncCount });
  } catch (e: any) {
    console.error('sync/quickbooks error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
