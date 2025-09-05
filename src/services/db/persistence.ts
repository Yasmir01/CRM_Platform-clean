import { prisma } from "@/lib/prisma";

import { prisma } from "@/lib/prisma";

export async function saveInvoice(invoice: {
  orgId?: string | null;
  externalId: string;
  source: "quickbooks" | "xero" | "wave";
  tenantId: string;
  propertyId?: string | null;
  amount: number;
  status: "draft" | "open" | "paid" | "voided" | string;
  dueDate?: string | Date | null;
  syncedAt?: Date;
}) {
  const due = invoice.dueDate ? new Date(invoice.dueDate) : null;
  return prisma.accountingInvoice.upsert({
    where: { externalId_source: { externalId: invoice.externalId, source: invoice.source } },
    update: { ...invoice, dueDate: due ?? undefined },
    create: { ...invoice, dueDate: due ?? undefined },
  });
}

export async function savePayment(payment: {
  orgId?: string | null;
  externalId: string;
  source: "quickbooks" | "xero" | "wave";
  tenantId: string;
  propertyId?: string | null;
  amount: number;
  method: string;
  status: "pending" | "completed" | "failed" | string;
  syncedAt?: Date;
}) {
  return prisma.accountingPayment.upsert({
    where: { externalId_source: { externalId: payment.externalId, source: payment.source } },
    update: payment,
    create: payment,
  });
}

export async function saveTenant(tenant: {
  orgId?: string | null;
  externalId: string;
  source: "quickbooks" | "xero" | "wave";
  name: string;
  email?: string | null;
  phone?: string | null;
  syncedAt?: Date;
}) {
  return prisma.accountingContact.upsert({
    where: { externalId_source: { externalId: tenant.externalId, source: tenant.source } },
    update: tenant,
    create: tenant,
  });
}
