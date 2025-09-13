import { PrismaClient } from '@prisma/client';

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Middleware: automatic tenant history logging
prisma.$use(async (params, next) => {
  const result = await next(params);

  // prevent recursion when creating history events
  if (params.model === 'HistoryEvent') return result;

  try {
    // Payment created
    if (params.model === 'Payment' && params.action === 'create') {
      const tenantId = result.tenantId;
      const amount = result.amount;
      await prisma.historyEvent.create({
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
    }

    // Support ticket created
    if (params.model === 'SupportTicket' && params.action === 'create') {
      const tenantId = result.tenantId;
      await prisma.historyEvent.create({
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
    }

    // Invoice resend — support both BillingInvoice and Invoice model names
    if ((params.model === 'Invoice' || params.model === 'BillingInvoice') && params.action === 'update') {
      // if the update sets a status or flag indicating resend
      if (result.status === 'resent' || result.resent === true || result.resentAt) {
        const tenantId = result.tenantId || result.tenantId || result.accountId || null;
        await prisma.historyEvent.create({
          data: {
            tenantId: tenantId,
            type: 'communication',
            details: `Invoice #${result.number || result.id} resent to tenant.`,
            metadata: { invoiceId: result.id },
          },
        });
      }
    }
  } catch (err) {
    console.warn('Failed to create history event:', err);
  }

  return result;
});
