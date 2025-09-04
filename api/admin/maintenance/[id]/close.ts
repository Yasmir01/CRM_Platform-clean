import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../../_db';
import { ensurePermission } from '../../../../src/lib/authorize';
import { notify } from '../../../../src/lib/notify';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const auth = ensurePermission(req, res, 'maintenance:manage');
  if (!auth) return;

  try {
    const id = String((req.query as any)?.id || '');
    if (!id) return res.status(400).json({ error: 'Missing id' });

    const request = await prisma.maintenanceRequest.update({
      where: { id },
      data: { status: 'closed' },
      include: { property: true },
    });

    // Archive related invoices and attachments
    const now = new Date();
    await prisma.maintenanceAttachment.updateMany({ where: { requestId: id }, data: { archivedAt: now } });
    try {
      const invoices = await prisma.maintenanceInvoice.findMany({ where: { requestId: id }, select: { id: true } });
      const invoiceIds = invoices.map((i) => i.id);
      if (invoiceIds.length > 0) {
        await prisma.maintenanceInvoice.updateMany({ where: { id: { in: invoiceIds } }, data: { archivedAt: now } });
        await prisma.invoiceFile.updateMany({ where: { invoiceId: { in: invoiceIds } }, data: { archivedAt: now } });
      }
    } catch {}

    // Notify tenant if present
    if (request.tenantId) {
      const address = request.property?.address ? ` ${request.property.address}` : '';
      await notify({
        userId: request.tenantId,
        type: 'maintenance_update',
        title: 'Maintenance Request Closed',
        message: `Your maintenance request${address ? ` for ${address}` : ''} has been resolved and closed by management.`,
        meta: { requestId: request.id, propertyId: request.propertyId, status: 'closed' },
      });
    }

    return res.status(200).json({ success: true, request });
  } catch (e: any) {
    console.error('maintenance close error', e?.message || e);
    return res.status(500).json({ error: 'failed' });
  }
}
