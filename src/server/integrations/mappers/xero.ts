import { Receipt } from "@prisma/client";

export function mapReceiptToXeroInvoice(r: Receipt) {
  return {
    Type: "ACCREC",
    Contact: { Name: r.leaseId },
    Date: new Date(r.issuedAt).toISOString().split("T")[0],
    DueDate: new Date(r.issuedAt).toISOString().split("T")[0],
    LineItems: [
      {
        Description: "Rent Payment",
        Quantity: 1,
        UnitAmount: Number(r.amount),
        AccountCode: "200",
      },
    ],
    Reference: `CRM Receipt ${r.id}`,
  };
}

export function mapReceiptToXeroPayment(invoiceId: string, r: Receipt) {
  return {
    Invoice: { InvoiceID: invoiceId },
    Account: { Code: "090" },
    Date: new Date(r.issuedAt).toISOString().split("T")[0],
    Amount: Number(r.amount),
    Reference: `CRM Payment for Receipt ${r.id}`,
  };
}
