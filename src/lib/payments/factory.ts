import { StripeProvider } from "./stripe";
import { PayPalProvider } from "./paypal";
import { PlaidProvider } from "./plaid";
import type { PaymentProvider, ProviderKey } from "./provider";

export function getPaymentProvider(provider: ProviderKey): PaymentProvider {
  switch (provider) {
    case "stripe": return StripeProvider;
    case "paypal": return PayPalProvider;
    case "plaid": return PlaidProvider;
    case "applepay": return StripeProvider;
    default: throw new Error("Unknown provider");
  }
}
