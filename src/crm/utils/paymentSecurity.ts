// src/crm/utils/paymentSecurity.ts
export function encryptCardNumber(cardNumber: string): string {
  return "****-****-****-" + cardNumber.slice(-4);
}

export function validatePaymentData(data: any): boolean {
  return !!data;
}

export function logSecurityEvent(event: string) {
  console.log("[SECURITY]", event);
}
