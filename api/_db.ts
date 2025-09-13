import { PrismaClient } from '@prisma/client';

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

import { sendEmail } from "../src/lib/mailer";

// Middleware: automatic tenant history logging
prisma.$use(async (params, next) => {
  const result = await next(params);

  // prevent recursion when creating history events or notifications
  if (params.model === 'HistoryEvent' || params.model === 'Notification') return result;

  try {
    // Payment created
    if (params.model === 'Payment' && params.action === 'create') {
      const tenantId = result.tenantId;
      const amount = result.amount;
      const he = await prisma.historyEvent.create({
        data: {
          tenantId: tenantId,
          type: 'payment',
          details: `Payment of $${amount} recorded.`,
          metadata: {
            invoiceId: result.invoiceId || null,
            method: result.method || null,
            paymentId: result.id || null,
          },
        },
      });

      // create notification + email
      try {
        if (tenantId) {
          await prisma.notification.create({ data: { tenantId, type: 'history', message: `Payment of $${amount} recorded.` } });
          const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
          if (tenant?.email) await sendEmail({ to: tenant.email, subject: 'Payment recorded', text: `We recorded your payment of $${amount}.` });
        }
      } catch (e) {
        console.warn('Failed to create/send notification for payment', e);
      }
    }

    // Support ticket created
    if (params.model === 'SupportTicket' && params.action === 'create') {
      const tenantId = result.tenantId;
      const he = await prisma.historyEvent.create({
        data: {
          tenantId: tenantId,
          type: 'support',
          details: `New support ticket created: ${result.subject}`,
          metadata: {
            ticketId: result.id,
            status: result.status || null,
          },
        },
      });

      try {
        if (tenantId) {
          await prisma.notification.create({ data: { tenantId, type: 'support', message: `New support ticket: ${result.subject}` } });
          const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
          if (tenant?.email) await sendEmail({ to: tenant.email, subject: 'Support ticket created', text: `Your support ticket has been created: ${result.subject}` });
        }
      } catch (e) {
        console.warn('Failed to create/send notification for support ticket', e);
      }
    }

    // Invoice resend — support both BillingInvoice and Invoice model names
    if ((params.model === 'Invoice' || params.model === 'BillingInvoice') && params.action === 'update') {
      // if the update sets a status or flag indicating resend
      if (result.status === 'resent' || result.resent === true || result.resentAt) {
        const tenantId = result.tenantId || result.accountId || null;
        await prisma.historyEvent.create({
          data: {
            tenantId: tenantId,
            type: 'communication',
            details: `Invoice #${result.number || result.id} resent to tenant.`,
            metadata: { invoiceId: result.id },
          },
        });

        try {
          if (tenantId) {
            await prisma.notification.create({ data: { tenantId, type: 'communication', message: `Invoice #${result.number || result.id} was resent.` } });
            const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
            if (tenant?.email) await sendEmail({ to: tenant.email, subject: 'Invoice resent', text: `Your invoice #${result.number || result.id} was resent.` });
          }
        } catch (e) {
          console.warn('Failed to create/send notification for invoice resend', e);
        }
      }
    }
  } catch (err) {
    console.warn('Failed to create history event:', err);
  }

  return result;
});
