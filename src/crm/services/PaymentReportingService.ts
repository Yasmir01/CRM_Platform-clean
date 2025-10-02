// src/crm/services/PaymentReportingService.ts
import { PaymentReport } from "../types/PaymentTypes";

export class PaymentReportingService {
  generateReport(): PaymentReport {
    return {
      id: "stub-report",
      period: "This Month",
      totalCollected: 0,
      failedPayments: 0,
    };
  }
}

export const paymentReportingService = new PaymentReportingService();
