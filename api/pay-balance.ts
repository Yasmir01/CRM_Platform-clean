import { prisma } from './_db';
import { requireAdminOr403 } from './_auth';

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!requireAdminOr403(req, res)) return;

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const leaseId = body?.leaseId as string | undefined;
    const amountCentsInput = body?.amountCents as number | string | undefined;
    const description = (body?.description as string | undefined) ?? 'Payment received';

    if (!leaseId || amountCentsInput === undefined || amountCentsInput === null) {
      return res.status(400).json({ error: 'leaseId and amountCents required' });
    }

    const amountCents = Math.floor(Number(amountCentsInput));
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return res.status(400).json({ error: 'amountCents must be a positive number' });
    }

    // Create PAYMENT entry as negative amount to offset charges
    await prisma.ledgerEntry.create({
      data: {
        leaseId,
        description,
        amountCents: -Math.abs(amountCents),
        type: 'PAYMENT' as any,
      },
    });

    // Recalculate balance and auto-close if zero
    const total = await prisma.ledgerEntry.aggregate({
      _sum: { amountCents: true },
      where: { leaseId },
    });

    if ((total._sum?.amountCents ?? 0) === 0) {
      try {
        await prisma.lease.update({ where: { id: leaseId }, data: { status: 'CLOSED' as any } });
      } catch {
        // ignore if lease not found or status update fails
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error('Pay balance API error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error?.message });
  }
}
