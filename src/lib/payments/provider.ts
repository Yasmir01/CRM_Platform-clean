export interface PaymentProvider {
  createPayment(amount: number, tenantId: string, methodId?: string): Promise<any>;
  refundPayment(paymentId: string, amount?: number): Promise<any>;
  listMethods?(tenantId: string): Promise<any[]>;
}

export type ProviderKey = "stripe" | "paypal" | "plaid" | "applepay";
