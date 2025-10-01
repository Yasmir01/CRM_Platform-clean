import { PrismaClient } from "@prisma/client";
import { getQBClient } from "../integrations/qbClient";
import { mapReceiptToQB } from "../integrations/mappers/quickbooks";
import { getXeroClient } from "../integrations/xeroClient";
import { mapReceiptToXeroInvoice, mapReceiptToXeroPayment } from "../integrations/mappers/xero";
import { getWaveClient } from "../integrations/waveClient";
import { mapReceiptToWaveTransaction } from "../integrations/mappers/wave";
import { pathToFileURL } from "url";

const prisma = new PrismaClient();

export async function syncQuickBooks(orgId: string) {
  const client = await getQBClient(orgId);

  // 1) Pull Payments from QB (sample query)
  const res = await client.get("/query", {
    params: { query: "SELECT * FROM Payment STARTPOSITION 1 MAXRESULTS 10" },
  });
  const qbPayments = res.data?.QueryResponse?.Payment || [];

  for (const qbp of qbPayments) {
    const extId = qbp.Id;
    const existing = await prisma.payment.findFirst({
      where: { externalRef: extId, organizationId: orgId },
    });
    if (!existing) {
      await prisma.payment.create({
        data: {
          leaseId: "unknown", // TODO: map CustomerRef back to lease
          organizationId: orgId,
          amount: qbp.TotalAmt,
          status: "SUCCEEDED",
          externalRef: extId,
          notes: "Imported from QuickBooks",
        },
      });
    }
  }

  // 2) Push CRM Receipts to QB (choose receipts whose linked payment has no externalRef)
  const receipts = await prisma.receipt.findMany({
    where: { organizationId: orgId, payment: { is: { externalRef: null } } },
    include: { payment: true },
    take: 3,
  });

  for (const r of receipts) {
    const qbData = mapReceiptToQB(r);

    const res2 = await client.post("/salesreceipt", qbData);
    const newId = res2.data?.SalesReceipt?.Id;

    if (newId && r.paymentId) {
      await prisma.payment.update({ where: { id: r.paymentId }, data: { externalRef: newId } });
    }
  }

  await prisma.syncLog.create({
    data: {
      organizationId: orgId,
      scope: "quickbooks",
      status: "success",
      itemCount: qbPayments.length + receipts.length,
      message: `QB sync imported ${qbPayments.length}, exported ${receipts.length}`,
    },
  });

  return { imported: qbPayments.length, exported: receipts.length };
}

export async function syncXero(orgId: string) {
  const client = await getXeroClient(orgId);

  // 1) Pull Invoices from Xero
  const res = await client.get("/Invoices");
  const invoices = res.data?.Invoices || [];

  for (const inv of invoices.slice(0, 5)) {
    const extId = inv.InvoiceID;
    const existing = await prisma.receipt.findFirst({
      where: { organizationId: orgId, number: `XERO-${extId}` },
    });
    if (!existing) {
      await prisma.receipt.create({
        data: {
          leaseId: "unknown",
          organizationId: orgId,
          amount: inv.Total,
          issuedAt: new Date(inv.Date),
          number: `XERO-${extId}`,
        },
      });
    }
  }

  // 2) Push CRM Receipts to Xero (create invoice + payment) for receipts whose linked payment has no externalRef
  const receipts = await prisma.receipt.findMany({
    where: {
      organizationId: orgId,
      payment: { is: { externalRef: null } },
      NOT: { number: { startsWith: "XERO-" } },
    },
    include: { payment: true },
    take: 3,
  });

  for (const r of receipts) {
    const invoiceRes = await client.post("/Invoices", { Invoices: [mapReceiptToXeroInvoice(r)] });
    const newInvoice = invoiceRes.data?.Invoices?.[0];
    if (newInvoice?.InvoiceID && r.paymentId) {
      await client.post("/Payments", { Payments: [mapReceiptToXeroPayment(newInvoice.InvoiceID, r)] });
      await prisma.payment.update({ where: { id: r.paymentId }, data: { externalRef: newInvoice.InvoiceID } });
    }
  }

  await prisma.syncLog.create({
    data: {
      organizationId: orgId,
      scope: "xero",
      status: "success",
      itemCount: invoices.length,
      message: `Xero sync imported ${invoices.length}, exported ${receipts.length}`,
    },
  });

  return { imported: invoices.length, exported: receipts.length };
}

export async function syncWave(orgId: string) {
  const client = await getWaveClient(orgId);

  const acc = await prisma.integrationAccount.findFirstOrThrow({
    where: { organizationId: orgId, provider: "WAVE" },
  });
  const businessId = acc.displayName || "demo-business";

  const importedCount = 0;

  const receipts = await prisma.receipt.findMany({
    where: { organizationId: orgId, payment: { is: { externalRef: null } } },
    include: { payment: true },
    take: 3,
  });

  for (const r of receipts) {
    const gql = mapReceiptToWaveTransaction(r, businessId);
    const res = await client.post("", gql);
    const data = res.data?.data?.transactionCreate;
    if (data?.didSucceed && r.paymentId) {
      await prisma.payment.update({ where: { id: r.paymentId }, data: { externalRef: data.transaction.id } });
    } else {
      // eslint-disable-next-line no-console
      console.error("Wave error", data?.inputErrors);
    }
  }

  await prisma.syncLog.create({
    data: {
      organizationId: orgId,
      scope: "wave",
      status: "success",
      itemCount: receipts.length,
      message: `Wave sync exported ${receipts.length} receipts (import disabled)`,
    },
  });

  return { imported: importedCount, exported: receipts.length };
}

const isMain = (() => {
  try {
    const entry = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
    return import.meta.url === entry;
  } catch {
    return false;
  }
})();

if (isMain) {
  (async () => {
    try {
      await syncQuickBooks("demo-org");
      // eslint-disable-next-line no-console
      console.log("QB sync finished");
      process.exit(0);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("QB sync error:", e);
      process.exit(1);
    }
  })();
}
