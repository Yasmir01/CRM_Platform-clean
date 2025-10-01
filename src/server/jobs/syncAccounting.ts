import { PrismaClient } from "@prisma/client";
import { getQBClient } from "../integrations/qbClient";
import { mapReceiptToQB } from "../integrations/mappers/quickbooks";
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
