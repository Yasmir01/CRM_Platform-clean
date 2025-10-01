// Simple PSP shim you can swap with Stripe/Dwolla later.
export type ChargeRequest = {
  amount: number; // in dollars
  currency: "USD" | "CAD" | "EUR" | "GBP";
  customerRef?: string; // optional for real PSP mapping
  methodExternalRef?: string; // token/id from vault
  metadata?: Record<string, string>;
};

export type ChargeResult =
  | { ok: true; id: string } // external payment id
  | { ok: false; error: string };

export async function charge(req: ChargeRequest): Promise<ChargeResult> {
  // MOCK: succeed anything > 0; fail if amount is 13.37 (for testing)
  if (req.amount <= 0) return { ok: false, error: "Invalid amount" };
  if (Math.abs(req.amount - 13.37) < 0.0001) {
    return { ok: false, error: "Test failure from PSP" };
  }
  // Simulate PSP latency
  await new Promise((r) => setTimeout(r, 200));
  return { ok: true, id: "psp_" + Math.random().toString(36).slice(2) };
}
