import paypal from "@paypal/checkout-server-sdk";
import { PaymentProvider } from "./provider";

const env = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID as string,
  process.env.PAYPAL_CLIENT_SECRET as string
);
const client = new paypal.core.PayPalHttpClient(env);

export const PayPalProvider: PaymentProvider = {
  async createPayment(amount) {
    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [{ amount: { currency_code: "USD", value: amount.toFixed(2) } }],
    });
    const order = await client.execute(request);
    return order.result;
  },
  async refundPayment(paymentId: string, amount?: number) {
    const request = new (paypal.payments as any).CapturesRefundRequest(paymentId);
    const body: any = { amount: { currency_code: "USD" } };
    if (typeof amount === 'number' && Number.isFinite(amount) && amount > 0) {
      body.amount.value = amount.toFixed(2);
    }
    request.requestBody(body);
    return await client.execute(request);
  },
};
