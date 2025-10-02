// src/crm/services/PaymentReminderService.ts
import { PaymentReminder } from "../types/PaymentTypes";

export class PaymentReminderService {
  private reminders: PaymentReminder[] = [];

  addReminder(reminder: PaymentReminder) {
    this.reminders.push(reminder);
  }

  listReminders() {
    return this.reminders;
  }
}

export const paymentReminderService = new PaymentReminderService();
