import { Receipt } from "@prisma/client";

export function mapReceiptToWaveTransaction(r: Receipt, businessId: string) {
  return {
    query: `
      mutation CreateTransaction($input: TransactionCreateInput!) {
        transactionCreate(input: $input) {
          didSucceed
          transaction {
            id
            description
          }
          inputErrors {
            code
            message
          }
        }
      }
    `,
    variables: {
      input: {
        businessId,
        externalId: r.id,
        description: `CRM Receipt ${r.id}`,
        date: new Date(r.issuedAt).toISOString().split("T")[0],
        amount: Number(r.amount),
        direction: "INFLOW",
        transactionType: "SALE",
      },
    },
  };
}
