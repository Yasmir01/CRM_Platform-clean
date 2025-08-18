import { PaymentReminder, RentPayment, PaymentSchedule } from '../types/PaymentTypes';
import { SecurityAuditLogger } from '../utils/paymentSecurity';

export interface ReminderTemplate {
  id: string;
  name: string;
  type: 'upcoming' | 'overdue' | 'failed' | 'success';
  method: 'email' | 'sms' | 'push' | 'mail';
  subject: string;
  content: string;
  isActive: boolean;
  variables: string[];
}

export interface NotificationSchedule {
  id: string;
  tenantId: string;
  reminderType: 'upcoming' | 'overdue';
  daysBeforeDue: number[];
  daysAfterDue: number[];
  methods: ('email' | 'sms' | 'push')[];
  isActive: boolean;
}

export interface AutoPayConfiguration {
  id: string;
  tenantId: string;
  paymentMethodId: string;
  isEnabled: boolean;
  retryAttempts: number;
  retryDays: number[];
  failureActions: ('email' | 'sms' | 'disable_autopay' | 'create_manual_payment')[];
  lastProcessed?: string;
  nextProcessing?: string;
}

export interface BulkReminderJob {
  id: string;
  type: 'upcoming' | 'overdue' | 'failed';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRecipients: number;
  processed: number;
  successful: number;
  failed: number;
  createdAt: string;
  completedAt?: string;
  errors: string[];
}

export class PaymentReminderService {
  private static instance: PaymentReminderService;
  private reminders: PaymentReminder[] = [];
  private templates: ReminderTemplate[] = [];
  private schedules: NotificationSchedule[] = [];
  private autoPayConfigs: AutoPayConfiguration[] = [];
  private jobs: BulkReminderJob[] = [];

  private constructor() {
    this.initializeDefaultTemplates();
    this.startAutomatedJobs();
  }

  public static getInstance(): PaymentReminderService {
    if (!PaymentReminderService.instance) {
      PaymentReminderService.instance = new PaymentReminderService();
    }
    return PaymentReminderService.instance;
  }

  // Reminder Templates Management
  async getReminderTemplates(): Promise<ReminderTemplate[]> {
    return this.templates.filter(t => t.isActive);
  }

  async createReminderTemplate(template: Omit<ReminderTemplate, 'id'>): Promise<ReminderTemplate> {
    const newTemplate: ReminderTemplate = {
      ...template,
      id: `tmpl_${Date.now()}`
    };
    this.templates.push(newTemplate);
    return newTemplate;
  }

  async updateReminderTemplate(templateId: string, updates: Partial<ReminderTemplate>): Promise<ReminderTemplate | null> {
    const index = this.templates.findIndex(t => t.id === templateId);
    if (index === -1) return null;

    this.templates[index] = { ...this.templates[index], ...updates };
    return this.templates[index];
  }

  // Notification Schedules
  async getNotificationSchedule(tenantId: string): Promise<NotificationSchedule | null> {
    return this.schedules.find(s => s.tenantId === tenantId && s.isActive) || null;
  }

  async createNotificationSchedule(schedule: Omit<NotificationSchedule, 'id'>): Promise<NotificationSchedule> {
    // Deactivate existing schedule for tenant
    this.schedules.forEach(s => {
      if (s.tenantId === schedule.tenantId) {
        s.isActive = false;
      }
    });

    const newSchedule: NotificationSchedule = {
      ...schedule,
      id: `sched_${Date.now()}`
    };
    this.schedules.push(newSchedule);
    return newSchedule;
  }

  // Individual Reminder Management
  async createPaymentReminder(
    tenantId: string,
    paymentId: string,
    type: PaymentReminder['type'],
    daysBeforeDue: number,
    method: PaymentReminder['method']
  ): Promise<PaymentReminder> {
    const reminder: PaymentReminder = {
      id: `rem_${Date.now()}`,
      tenantId,
      paymentId,
      type,
      daysBeforeDue,
      method,
      sent: false,
      createdAt: new Date().toISOString()
    };

    this.reminders.push(reminder);
    return reminder;
  }

  async sendIndividualReminder(reminderId: string): Promise<{ success: boolean; error?: string }> {
    const reminder = this.reminders.find(r => r.id === reminderId);
    if (!reminder) {
      return { success: false, error: 'Reminder not found' };
    }

    if (reminder.sent) {
      return { success: false, error: 'Reminder already sent' };
    }

    try {
      const template = this.getTemplateForReminder(reminder);
      const success = await this.sendNotification(reminder, template);
      
      if (success) {
        reminder.sent = true;
        reminder.sentAt = new Date().toISOString();

        // Log the event
        SecurityAuditLogger.logSecurityEvent({
          eventType: 'payment_processed',
          userId: reminder.tenantId,
          paymentId: reminder.paymentId,
          result: 'success',
          message: `Payment reminder sent via ${reminder.method}`,
          timestamp: Date.now()
        });

        return { success: true };
      } else {
        return { success: false, error: 'Failed to send notification' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Bulk Reminder Processing
  async processPendingReminders(): Promise<BulkReminderJob> {
    const pendingReminders = this.reminders.filter(r => !r.sent);
    
    const job: BulkReminderJob = {
      id: `job_${Date.now()}`,
      type: 'upcoming', // This would be determined by the reminder types
      status: 'processing',
      totalRecipients: pendingReminders.length,
      processed: 0,
      successful: 0,
      failed: 0,
      createdAt: new Date().toISOString(),
      errors: []
    };

    this.jobs.push(job);

    // Process reminders in batches
    const batchSize = 10;
    for (let i = 0; i < pendingReminders.length; i += batchSize) {
      const batch = pendingReminders.slice(i, i + batchSize);
      await this.processBatch(batch, job);
    }

    job.status = 'completed';
    job.completedAt = new Date().toISOString();
    
    return job;
  }

  private async processBatch(reminders: PaymentReminder[], job: BulkReminderJob): Promise<void> {
    const promises = reminders.map(async (reminder) => {
      try {
        const result = await this.sendIndividualReminder(reminder.id);
        job.processed++;
        
        if (result.success) {
          job.successful++;
        } else {
          job.failed++;
          job.errors.push(`Reminder ${reminder.id}: ${result.error}`);
        }
      } catch (error) {
        job.processed++;
        job.failed++;
        job.errors.push(`Reminder ${reminder.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    await Promise.all(promises);
  }

  // Automated Reminder Generation
  async generateUpcomingPaymentReminders(payments: RentPayment[]): Promise<PaymentReminder[]> {
    const newReminders: PaymentReminder[] = [];
    const currentDate = new Date();

    for (const payment of payments) {
      if (payment.status !== 'pending') continue;

      const schedule = await this.getNotificationSchedule(payment.tenantId);
      if (!schedule || !schedule.isActive) continue;

      const dueDate = new Date(payment.dueDate);
      const daysDifference = Math.ceil((dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

      // Check if we need to send upcoming reminders
      for (const daysBefore of schedule.daysBeforeDue) {
        if (daysDifference === daysBefore) {
          // Check if reminder already exists
          const existingReminder = this.reminders.find(r => 
            r.paymentId === payment.id && 
            r.type === 'upcoming' && 
            r.daysBeforeDue === daysBefore
          );

          if (!existingReminder) {
            for (const method of schedule.methods) {
              const reminder = await this.createPaymentReminder(
                payment.tenantId,
                payment.id,
                'upcoming',
                daysBefore,
                method
              );
              newReminders.push(reminder);
            }
          }
        }
      }

      // Check if we need to send overdue reminders
      if (daysDifference < 0) {
        const daysOverdue = Math.abs(daysDifference);
        
        for (const daysAfter of schedule.daysAfterDue) {
          if (daysOverdue === daysAfter) {
            const existingReminder = this.reminders.find(r => 
              r.paymentId === payment.id && 
              r.type === 'overdue' && 
              r.daysBeforeDue === daysAfter
            );

            if (!existingReminder) {
              for (const method of schedule.methods) {
                const reminder = await this.createPaymentReminder(
                  payment.tenantId,
                  payment.id,
                  'overdue',
                  daysAfter,
                  method
                );
                newReminders.push(reminder);
              }
            }
          }
        }
      }
    }

    return newReminders;
  }

  // Auto-Pay Management
  async setupAutoPay(config: Omit<AutoPayConfiguration, 'id'>): Promise<AutoPayConfiguration> {
    // Disable existing auto-pay for tenant
    this.autoPayConfigs.forEach(c => {
      if (c.tenantId === config.tenantId) {
        c.isEnabled = false;
      }
    });

    const newConfig: AutoPayConfiguration = {
      ...config,
      id: `auto_${Date.now()}`
    };
    this.autoPayConfigs.push(newConfig);
    return newConfig;
  }

  async getAutoPayConfiguration(tenantId: string): Promise<AutoPayConfiguration | null> {
    return this.autoPayConfigs.find(c => c.tenantId === tenantId && c.isEnabled) || null;
  }

  async processAutoPayments(payments: RentPayment[]): Promise<{ processed: number; successful: number; failed: number }> {
    let processed = 0;
    let successful = 0;
    let failed = 0;

    const currentDate = new Date();
    const eligiblePayments = payments.filter(p => 
      p.status === 'pending' && 
      new Date(p.dueDate) <= currentDate
    );

    for (const payment of eligiblePayments) {
      const autoPayConfig = await this.getAutoPayConfiguration(payment.tenantId);
      if (!autoPayConfig) continue;

      processed++;

      try {
        // Simulate auto-payment processing
        const success = await this.processAutoPayment(payment, autoPayConfig);
        
        if (success) {
          successful++;
          
          // Send success notification
          await this.sendPaymentConfirmation(payment.tenantId, payment.id);
        } else {
          failed++;
          
          // Handle failure
          await this.handleAutoPayFailure(payment, autoPayConfig);
        }
      } catch (error) {
        failed++;
        console.error('Auto-pay processing error:', error);
      }
    }

    return { processed, successful, failed };
  }

  private async processAutoPayment(payment: RentPayment, config: AutoPayConfiguration): Promise<boolean> {
    // Simulate payment processing with 90% success rate
    const success = Math.random() > 0.1;
    
    if (success) {
      // Update payment status (in real implementation, this would be done by PaymentService)
      payment.status = 'completed';
      payment.paidDate = new Date().toISOString();
      payment.paymentMethodId = config.paymentMethodId;
    }

    return success;
  }

  private async handleAutoPayFailure(payment: RentPayment, config: AutoPayConfiguration): Promise<void> {
    const actions = config.failureActions;

    for (const action of actions) {
      switch (action) {
        case 'email':
          await this.sendFailureNotification(payment.tenantId, payment.id, 'email');
          break;
        case 'sms':
          await this.sendFailureNotification(payment.tenantId, payment.id, 'sms');
          break;
        case 'disable_autopay':
          config.isEnabled = false;
          break;
        case 'create_manual_payment':
          // Create a reminder for manual payment
          await this.createPaymentReminder(
            payment.tenantId,
            payment.id,
            'failed',
            0,
            'email'
          );
          break;
      }
    }
  }

  // Notification Methods
  private async sendNotification(reminder: PaymentReminder, template: ReminderTemplate): Promise<boolean> {
    try {
      switch (reminder.method) {
        case 'email':
          return await this.sendEmailNotification(reminder, template);
        case 'sms':
          return await this.sendSmsNotification(reminder, template);
        case 'push':
          return await this.sendPushNotification(reminder, template);
        case 'mail':
          return await this.sendMailNotification(reminder, template);
        default:
          return false;
      }
    } catch (error) {
      console.error(`Failed to send ${reminder.method} notification:`, error);
      return false;
    }
  }

  private async sendEmailNotification(reminder: PaymentReminder, template: ReminderTemplate): Promise<boolean> {
    // Simulate email sending
    console.log(`Sending email reminder for payment ${reminder.paymentId}`);
    await new Promise(resolve => setTimeout(resolve, 100));
    return Math.random() > 0.05; // 95% success rate
  }

  private async sendSmsNotification(reminder: PaymentReminder, template: ReminderTemplate): Promise<boolean> {
    // Simulate SMS sending
    console.log(`Sending SMS reminder for payment ${reminder.paymentId}`);
    await new Promise(resolve => setTimeout(resolve, 100));
    return Math.random() > 0.08; // 92% success rate
  }

  private async sendPushNotification(reminder: PaymentReminder, template: ReminderTemplate): Promise<boolean> {
    // Simulate push notification
    console.log(`Sending push reminder for payment ${reminder.paymentId}`);
    await new Promise(resolve => setTimeout(resolve, 50));
    return Math.random() > 0.02; // 98% success rate
  }

  private async sendMailNotification(reminder: PaymentReminder, template: ReminderTemplate): Promise<boolean> {
    // Simulate physical mail preparation
    console.log(`Preparing mail reminder for payment ${reminder.paymentId}`);
    await new Promise(resolve => setTimeout(resolve, 200));
    return Math.random() > 0.1; // 90% success rate
  }

  private async sendPaymentConfirmation(tenantId: string, paymentId: string): Promise<void> {
    const confirmationTemplate = this.templates.find(t => t.type === 'success' && t.method === 'email');
    if (confirmationTemplate) {
      await this.sendEmailNotification(
        {
          id: `conf_${Date.now()}`,
          tenantId,
          paymentId,
          type: 'upcoming',
          daysBeforeDue: 0,
          method: 'email',
          sent: false,
          createdAt: new Date().toISOString()
        },
        confirmationTemplate
      );
    }
  }

  private async sendFailureNotification(tenantId: string, paymentId: string, method: 'email' | 'sms'): Promise<void> {
    const failureTemplate = this.templates.find(t => t.type === 'failed' && t.method === method);
    if (failureTemplate) {
      const reminder: PaymentReminder = {
        id: `fail_${Date.now()}`,
        tenantId,
        paymentId,
        type: 'failed',
        daysBeforeDue: 0,
        method,
        sent: false,
        createdAt: new Date().toISOString()
      };
      
      await this.sendNotification(reminder, failureTemplate);
    }
  }

  private getTemplateForReminder(reminder: PaymentReminder): ReminderTemplate {
    const template = this.templates.find(t => 
      t.type === reminder.type && 
      t.method === reminder.method && 
      t.isActive
    );
    
    if (!template) {
      // Return default template
      return this.templates.find(t => t.id === 'default_email') || this.templates[0];
    }
    
    return template;
  }

  // Automated Job Scheduling
  private startAutomatedJobs(): void {
    // Run reminder generation every hour
    setInterval(async () => {
      try {
        // This would be triggered by the PaymentService or a scheduler
        console.log('Running automated reminder generation...');
      } catch (error) {
        console.error('Error in automated reminder generation:', error);
      }
    }, 60 * 60 * 1000); // 1 hour

    // Run auto-pay processing daily at 6 AM
    setInterval(async () => {
      const now = new Date();
      if (now.getHours() === 6 && now.getMinutes() === 0) {
        try {
          console.log('Running automated auto-pay processing...');
          // This would be triggered with actual payment data
        } catch (error) {
          console.error('Error in automated auto-pay processing:', error);
        }
      }
    }, 60 * 1000); // Check every minute
  }

  // Job Status and History
  async getBulkJobHistory(): Promise<BulkReminderJob[]> {
    return this.jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getBulkJobStatus(jobId: string): Promise<BulkReminderJob | null> {
    return this.jobs.find(j => j.id === jobId) || null;
  }

  // Initialize Default Templates
  private initializeDefaultTemplates(): void {
    this.templates = [
      {
        id: 'default_email',
        name: 'Default Email Reminder',
        type: 'upcoming',
        method: 'email',
        subject: 'Rent Payment Reminder - Due {{dueDate}}',
        content: `Dear {{tenantName}},

This is a friendly reminder that your rent payment of ${{amount}} is due on {{dueDate}}.

You can make your payment using any of the following methods:
- Online at our tenant portal
- ACH bank transfer
- Credit/debit card
- Cash at participating locations (Western Union, Walmart, etc.)

If you have any questions or need assistance, please contact us.

Thank you,
Property Management Team`,
        isActive: true,
        variables: ['tenantName', 'amount', 'dueDate', 'propertyAddress']
      },
      {
        id: 'default_sms',
        name: 'Default SMS Reminder',
        type: 'upcoming',
        method: 'sms',
        subject: '',
        content: 'Rent reminder: ${{amount}} due {{dueDate}}. Pay online or at participating locations. Questions? Call us.',
        isActive: true,
        variables: ['amount', 'dueDate']
      },
      {
        id: 'overdue_email',
        name: 'Overdue Email Notice',
        type: 'overdue',
        method: 'email',
        subject: 'URGENT: Overdue Rent Payment - {{propertyAddress}}',
        content: `Dear {{tenantName}},

Your rent payment of ${{amount}} was due on {{dueDate}} and is now overdue.

Please make your payment immediately to avoid late fees and potential eviction proceedings.

Late fee: ${{lateFee}}
Total amount due: ${{totalDue}}

Contact us immediately if you're experiencing financial difficulties.

Property Management Team`,
        isActive: true,
        variables: ['tenantName', 'amount', 'dueDate', 'lateFee', 'totalDue', 'propertyAddress']
      },
      {
        id: 'success_email',
        name: 'Payment Confirmation',
        type: 'success',
        method: 'email',
        subject: 'Payment Received - Thank You!',
        content: `Dear {{tenantName}},

We have successfully received your rent payment of ${{amount}} for {{propertyAddress}}.

Payment Details:
- Amount: ${{amount}}
- Date: {{paymentDate}}
- Method: {{paymentMethod}}
- Confirmation: {{confirmationCode}}

Thank you for your prompt payment!

Property Management Team`,
        isActive: true,
        variables: ['tenantName', 'amount', 'propertyAddress', 'paymentDate', 'paymentMethod', 'confirmationCode']
      },
      {
        id: 'failed_email',
        name: 'Payment Failed Notice',
        type: 'failed',
        method: 'email',
        subject: 'Payment Failed - Action Required',
        content: `Dear {{tenantName}},

We were unable to process your automatic rent payment of ${{amount}} due to {{failureReason}}.

Please:
1. Check your payment method details
2. Ensure sufficient funds are available
3. Make a manual payment to avoid late fees

Contact us if you need assistance.

Property Management Team`,
        isActive: true,
        variables: ['tenantName', 'amount', 'failureReason']
      }
    ];
  }
}

export const paymentReminderService = PaymentReminderService.getInstance();
