import type { PaymentInput, PaymentProvider, PaymentResult } from './provider';

export function paypalProvider(): PaymentProvider {
  return {
    async createPayment(input: PaymentInput): Promise<PaymentResult> {
      const id = `paypal_${Date.now()}`;
      const redirectUrl = `${input.returnUrl}?status=success&pid=${encodeURIComponent(id)}`;
      return { id, status: 'pending', redirectUrl };
    },
    async handleWebhook(_req: Request): Promise<void> {
      // Implement when wiring PayPal webhooks
    },
  };
}
