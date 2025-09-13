import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { prisma } from './_db';

export const config = { api: { bodyParser: false } } as any;

export default async function handler(req: VercelRequest & { rawBody?: Buffer }, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) return res.status(400).json({ error: 'Stripe not configured' });

  const chunks: Buffer[] = [];
  await new Promise<void>((resolve) => {
    (req as any).on('data', (chunk: Buffer) => chunks.push(chunk));
    (req as any).on('end', () => resolve());
  });
  const buf = Buffer.concat(chunks);

  const stripe = new Stripe(secret, { apiVersion: '2024-06-20' });

  let event: Stripe.Event;
  try {
    const sig = (req.headers['stripe-signature'] || '') as string;
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed', err?.message || err);
    return res.status(400).send(`Webhook Error: ${err?.message || err}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session & { metadata?: any };
      const accountId = session.metadata?.accountId as string | undefined;
      const priceId = session.metadata?.priceId as string | undefined;

      let plan: 'FREE' | 'PRO' | 'ENTERPRISE' = 'FREE';
      if (priceId && process.env.STRIPE_PRICE_PRO && priceId === process.env.STRIPE_PRICE_PRO) plan = 'PRO';
      if (priceId && process.env.STRIPE_PRICE_ENTERPRISE && priceId === process.env.STRIPE_PRICE_ENTERPRISE) plan = 'ENTERPRISE';

      if (accountId) {
        try {
          await prisma.account.update({ where: { id: accountId }, data: { plan } as any });
          console.log('Account plan updated from webhook', accountId, plan);
        } catch (e) {
          console.error('Failed to update account plan', e);
        }
      }
    }

    if (event.type === 'invoice.finalized') {
      const invoice = event.data.object as any;
      // try to get accountId from metadata, else try subscription
      let accountId = invoice.metadata?.accountId as string | undefined;
      if (!accountId && invoice.subscription) {
        try {
          const sub = await prisma.account.findFirst({ where: { stripeSubId: String(invoice.subscription) } });
          if (sub) accountId = sub.id;
        } catch (e) { /* ignore */ }
      }

      if (accountId) {
        try {
          const { generateInvoicePdf } = await import('../../src/lib/invoicePdf');
          const { sendEmail } = await import('../../src/lib/mailer');
          const { s3Upload } = await import('../../src/lib/storage');

          const pdfBytes = await generateInvoicePdf(invoice, accountId);

          // Upload to storage
          const fileName = `invoices/${accountId}/invoice-${invoice.number || invoice.id}.pdf`;
          let pdfUrl: string | undefined = undefined;
          try {
            pdfUrl = await s3Upload(fileName, pdfBytes);
          } catch (uploadErr) {
            console.warn('Failed to upload invoice PDF to storage', uploadErr);
          }

          // Persist invoice record
          try {
            await prisma.billingInvoice.create({
              data: {
                accountId,
                stripeId: invoice.id,
                number: invoice.number || invoice.id,
                amount: invoice.amount_due ?? invoice.total ?? 0,
                periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : new Date(),
                periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : new Date(),
                pdfUrl: pdfUrl ?? '',
              } as any,
            });
          } catch (dbErr) {
            console.error('Failed to save billing invoice to DB', dbErr);
          }

          // Send email with attachment
          await sendEmail({
            to: invoice.customer_email || invoice.customer || undefined,
            subject: `Invoice #${invoice.number || invoice.id}`,
            text: 'Your invoice is attached.',
            attachments: [{ filename: `invoice-${invoice.number || invoice.id}.pdf`, content: Buffer.from(pdfBytes) }],
          });
        } catch (e) {
          console.error('Failed to generate/send invoice PDF', e);
        }
      }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
      const subscription = event.data.object as Stripe.Subscription & { metadata?: any };
      const accountId = subscription.metadata?.accountId as string | undefined;
      if (accountId) {
        try {
          const seatItem = subscription.items && (subscription.items as any).data.find((it: any) => String(it.price?.id) === String(process.env.STRIPE_PRICE_PER_SEAT));
          const seats = seatItem ? Number(seatItem.quantity || 1) : 1;
          await prisma.account.update({ where: { id: accountId }, data: { stripeSubId: subscription.id, seats } as any });
          console.log('Updated account seats from subscription event', accountId, seats);
        } catch (e) {
          console.error('Failed to persist subscription update', e);
        }
      }
    }
  } catch (e) {
    console.error('Webhook handler error', e);
  }

  res.status(200).json({ received: true });
}
