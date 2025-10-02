import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserOr401 } from '../../src/utils/authz';
import { prisma } from '../_db';
import { getPaymentProvider } from '../../src/lib/payments/factory';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const user = getUserOr401(req, res);
  if (!user) return;
  const role = String((user as any).role || '').toUpperCase();
  const roles = Array.isArray((user as any).roles) ? (user as any).roles.map((r: string) => String(r).toUpperCase()) : [];
  const isTenant = role === 'TENANT' || roles.includes('TENANT');
  if (!isTenant) return res.status(401).json({ error: 'Unauthorized' });

  const dbUser = await prisma.user.findUnique({ where: { id: String((user as any).sub) } });
  if (!dbUser) return res.status(401).json({ error: 'Unauthorized' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const amount = Number(body.amount || 0);
  const provider = String(body.provider || 'stripe');
  const methodId = body.methodId ? String(body.methodId) : undefined;
  const propertyId = body.propertyId ? String(body.propertyId) : undefined;

  try {
    // calculate late fee if applicable
    let total = amount;
    let wasLate = false;
    let lateFeeApplied = 0;
    try {
      if (propertyId) {
        const { calculateLateFee } = await import('../../src/lib/payments/fees');
        const { isLate, lateFee } = await calculateLateFee(propertyId, new Date());
        if (isLate) {
          wasLate = true;
          lateFeeApplied = Number(lateFee) || 0;
          total += lateFeeApplied;
        }
      }
    } catch (e) {
      console.error('late fee calc error', (e as any)?.message || e);
    }
    if (wasLate && lateFeeApplied > 0) {
      try {
        const { logPaymentAudit } = await import('../../src/lib/payments/audit');
        await logPaymentAudit({ tenantId: dbUser.id, action: 'late_fee_applied', details: `Late fee $${lateFeeApplied} applied to property ${propertyId || ''}`, actorId: dbUser.id });
      } catch (e) {
        console.error('late_fee_applied audit error', (e as any)?.message || e);
      }
    }

    const providerImpl = getPaymentProvider(provider as any);
    const customerId = provider === 'stripe' || provider === 'applepay' ? (dbUser.stripeCustomerId || '') : String(dbUser.id);
    const result = await providerImpl.createPayment(total, customerId, methodId);

    const payment = await prisma.rentPayment.create({
      data: {
        tenantId: dbUser.id,
        amount: total,
        status: 'success',
        gateway: provider,
        methodId: methodId || null,
        externalId: (result && typeof result === 'object' && (result as any).id) ? String((result as any).id) : null,
      },
    });

    // Send tenant receipt via email (if SMTP configured)
    // Audit: payment created
    try {
      const { logPaymentAudit } = await import('../../src/lib/payments/audit');
      await logPaymentAudit({ paymentId: payment.id, tenantId: dbUser.id, action: 'payment_created', details: `Amount: $${Number(payment.amount).toFixed(2)}, Gateway: ${provider}`, actorId: dbUser.id });
    } catch (e) {
      console.error('payment_created audit error', (e as any)?.message || e);
    }

    try {
      if (dbUser.email && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        const subject = 'Rent Payment Receipt';
        const html = `<h1>Payment Received</h1>
<p>Hi ${dbUser.name || ''},</p>
<p>We received your rent payment of <strong>$${Number(payment.amount).toFixed(2)}</strong> via ${provider}.</p>
<p>Date: ${new Date().toLocaleString()}</p>
<p>Thank you!</p>`;
        const { sendHtmlMail } = await import('../../src/lib/mailer');
        await sendHtmlMail([dbUser.email], subject, html);
        try {
          await prisma.paymentReceipt.create({
            data: { paymentId: payment.id, tenantId: dbUser.id, type: 'email', status: 'sent' },
          });
        } catch {}
      }
    } catch (e) {
      console.error('receipt email error', (e as any)?.message || e);
      try {
        await prisma.paymentReceipt.create({
          data: { paymentId: payment.id, tenantId: dbUser.id, type: 'email', status: 'failed' },
        });
      } catch {}
    }

    // Optional SMS if phone is available and Twilio is configured
    try {
      const phone = (dbUser as any)?.phone as string | undefined;
      if (phone && process.env.TWILIO_SID && process.env.TWILIO_TOKEN && process.env.TWILIO_FROM) {
        const { sendSMS } = await import('../../src/lib/sms');
        await sendSMS(phone, `Rent payment of $${Number(payment.amount).toFixed(2)} received via ${provider}. Thank you!`);
        try {
          await prisma.paymentReceipt.create({
            data: { paymentId: payment.id, tenantId: dbUser.id, type: 'sms', status: 'sent' },
          });
        } catch {}
      }
    } catch (e) {
      console.error('receipt sms error', (e as any)?.message || e);
      try {
        await prisma.paymentReceipt.create({
          data: { paymentId: payment.id, tenantId: dbUser.id, type: 'sms', status: 'failed' },
        });
      } catch {}
    }

    // Super Admin notification via email + dashboard log
    try {
      const suEmail = process.env.SUPERADMIN_EMAIL;
      const suMsg = `Tenant ${dbUser.name || dbUser.email} paid $${Number(payment.amount).toFixed(2)} via ${provider}.`;
      if (suEmail && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        const { sendHtmlMail } = await import('../../src/lib/mailer');
        await sendHtmlMail([suEmail], 'New Rent Payment', `<p>${suMsg}</p>`);
      }
      await prisma.notification.create({
        data: {
          title: 'New Rent Payment',
          message: suMsg,
          audience: 'SUPER_ADMIN',
          createdBy: dbUser.id,
        },
      });
    } catch (e) {
      console.error('admin notify error', (e as any)?.message || e);
    }

    return res.status(200).json({ ok: true, payment, providerResponse: result });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || 'Payment failed' });
  }
}
