export type PaymentInput = {
  leaseId: string;
  tenantId: string;
  amount: number;
  currency: string;
  method: string;
  returnUrl?: string;
};

export type PaymentResult = {
  id: string;
  status: 'pending' | 'succeeded' | 'failed';
  redirectUrl?: string;
};

export interface PaymentProvider {
  createPayment(input: PaymentInput): Promise<PaymentResult>;
  handleWebhook(req: Request): Promise<void>;
}

export async function getPaymentProvider(method: string): Promise<PaymentProvider> {
  if (method.startsWith('stripe')) {
    const mod = await import('./stripe');
    return mod.stripeProvider();
  }
  if (method.startsWith('paypal')) {
    const mod = await import('./paypal');
    return mod.paypalProvider();
  }
  throw new Error(`Unsupported method ${method}`);
}
