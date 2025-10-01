import { Payment, Receipt } from "@prisma/client";

export function mapPaymentToQB(p: Payment) {
  return {
    CustomerRef: { value: p.leaseId },
    TotalAmt: Number(p.amount),
    PrivateNote: `CRM Payment ${p.id}`,
  };
}

export function mapReceiptToQB(r: Receipt) {
  return {
    Line: [
      {
        Amount: Number(r.amount),
        DetailType: "SalesItemLineDetail",
        SalesItemLineDetail: { ItemRef: { value: "1", name: "Rent" } },
      },
    ],
    CustomerRef: { value: r.leaseId },
    TxnDate: new Date(r.issuedAt).toISOString().split("T")[0],
    PrivateNote: `CRM Receipt ${r.id}`,
  };
}
