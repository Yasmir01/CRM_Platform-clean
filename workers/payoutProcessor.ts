import { prisma } from '../api/_db';
import Stripe from 'stripe';

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY as string | undefined;
const stripe = STRIPE_KEY ? new Stripe(STRIPE_KEY, { apiVersion: '2023-10-16' }) : null;

async function ensureRecord(invId: string, vendorId: string, amount: number) {
  const externalId = `vendor_payout:${invId}`;
  const source = 'stripe_connect';
  const existing = await prisma.accountingPayment.findUnique({ where: { externalId_source: { externalId, source } } }).catch(() => null as any);
  if (existing) return existing;
  return prisma.accountingPayment.create({
    data: {
      orgId: null,
      externalId,
      source,
      tenantId: vendorId,
      amount,
      method: 'transfer',
      status: 'pending',
    },
  });
}

async function processPayouts() {
  if (!stripe) {
    console.error('STRIPE_SECRET_KEY not set; exiting');
    return;
  }

  // Pull recently approved invoices (limit batch)
  const approved = await prisma.maintenanceInvoice.findMany({
    where: { status: 'approved' },
    orderBy: { uploadedAt: 'desc' },
    take: 50,
    select: { id: true, amount: true, vendorId: true },
  });

  for (const inv of approved) {
    const amountUsd = Number(inv.amount || 0);
    if (!amountUsd || amountUsd <= 0) continue;

    const record = await ensureRecord(inv.id, inv.vendorId, amountUsd);
    if (record.status === 'completed') continue; // idempotent

    // Load vendor (User with role VENDOR) and get connect account id (if present)
    const vendor = await prisma.user.findUnique({ where: { id: inv.vendorId } });
    const connectId = (vendor as any)?.stripeAccountId as string | undefined;
    if (!connectId) {
      await prisma.accountingPayment.update({ where: { id: record.id }, data: { status: 'failed' } }).catch(() => {});
      console.error(`Missing stripeAccountId for vendor ${inv.vendorId}; skipping`);
      continue;
    }

    const amountCents = Math.round(amountUsd * 100);
    try {
      const transfer = await stripe.transfers.create({
        amount: amountCents,
        currency: 'usd',
        destination: connectId,
        metadata: { invoiceId: inv.id, vendorId: inv.vendorId },
      });

      await prisma.accountingPayment.update({
        where: { id: record.id },
        data: { status: 'completed', method: `transfer:${transfer.id}` },
      });
    } catch (err) {
      console.error('Payout failed', err);
      await prisma.accountingPayment.update({ where: { id: record.id }, data: { status: 'failed' } }).catch(() => {});
    }
  }
}

processPayouts().then(() => process.exit());
