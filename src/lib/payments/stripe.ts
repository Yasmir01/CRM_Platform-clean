import Stripe from "stripe";
import { PaymentProvider } from "./provider";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2024-06-20" } as any);

export const StripeProvider: PaymentProvider = {
  async createPayment(amount, tenantId, methodId) {
    return await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "usd",
      customer: tenantId,
      payment_method: methodId,
      confirm: true,
    });
  },
  async refundPayment(paymentId) {
    return await stripe.refunds.create({ payment_intent: paymentId });
  },
};
