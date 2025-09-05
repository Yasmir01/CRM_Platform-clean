import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    if (body?.type === 'charge.dispute.created') {
      const paymentId = body?.data?.object?.payment_intent || body?.data?.object?.id || 'unknown';
      const reason = body?.data?.object?.reason || 'unspecified';
      await prisma.paymentDispute.create({ data: { paymentId, status: 'open', reason } });
      try {
        await prisma.notification.create({ data: { title: 'Payment Dispute Opened', message: `Dispute for payment ${paymentId}`, audience: 'SUPER_ADMIN', createdBy: 'system' } });
      } catch {}
      try {
        await prisma.paymentAudit.create({ data: { paymentId, action: 'dispute_opened', details: reason, actorId: 'system' } });
      } catch {}
    }

    if (body?.type === 'charge.dispute.closed') {
      const paymentId = body?.data?.object?.payment_intent || body?.data?.object?.id || 'unknown';
      const status = body?.data?.object?.status || 'resolved';
      await prisma.paymentDispute.updateMany({ where: { paymentId, status: { in: ['open', 'under_review'] } }, data: { status: 'resolved', resolvedAt: new Date() } });
      try {
        await prisma.notification.create({ data: { title: 'Payment Dispute Resolved', message: `Dispute resolved for payment ${paymentId} (${status})`, audience: 'SUPER_ADMIN', createdBy: 'system' } });
      } catch {}
      try {
        await prisma.paymentAudit.create({ data: { paymentId, action: 'dispute_resolved', details: status, actorId: 'system' } });
      } catch {}
    }

    return res.status(200).json({ received: true });
  } catch (e: any) {
    console.error('payments webhook error', e?.message || e);
    return res.status(200).json({ received: true });
  }
}
