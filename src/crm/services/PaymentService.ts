// src/crm/services/PaymentService.ts
import { Payment } from "../types/PaymentTypes";

export class PaymentService {
  private payments: Payment[] = [];

  createPayment(payment: Payment): Payment {
    this.payments.push(payment);
    return payment;
  }

  listPayments(): Payment[] {
    return this.payments;
  }

  getPaymentById(id: string): Payment | undefined {
    return this.payments.find(p => p.id === id);
  }
}

export const paymentService = new PaymentService();
