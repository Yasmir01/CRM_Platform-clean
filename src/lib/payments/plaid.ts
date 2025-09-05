import { PaymentProvider } from "./provider";

export const PlaidProvider: PaymentProvider = {
  async createPayment(amount) {
    return { ok: true, id: `plaid_txn_${Date.now()}`, amount };
  },
  async refundPayment(paymentId: string) {
    return { ok: true, refundId: `plaid_refund_${paymentId}` };
  },
};
