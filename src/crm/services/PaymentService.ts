import { 
  RentPayment, 
  PaymentMethod, 
  PaymentSchedule, 
  PaymentReminder,
  CashPaymentLocation,
  PaymentProcessor,
  AutoPaySetup,
  PaymentDispute,
  PaymentReport
} from '../types/PaymentTypes';

export class PaymentService {
  private static instance: PaymentService;
  private payments: RentPayment[] = [];
  private paymentMethods: PaymentMethod[] = [];
  private schedules: PaymentSchedule[] = [];
  private reminders: PaymentReminder[] = [];
  private processors: PaymentProcessor[] = [];
  private cashLocations: CashPaymentLocation[] = [];
  private autoPaySetups: AutoPaySetup[] = [];
  private disputes: PaymentDispute[] = [];

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  // Payment Methods
  async getPaymentMethods(tenantId: string): Promise<PaymentMethod[]> {
    return this.paymentMethods.filter(pm => pm.id.includes(tenantId));
  }

  async addPaymentMethod(tenantId: string, method: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentMethod> {
    const newMethod: PaymentMethod = {
      ...method,
      id: `pm_${tenantId}_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.paymentMethods.push(newMethod);
    return newMethod;
  }

  async updatePaymentMethod(methodId: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod | null> {
    const index = this.paymentMethods.findIndex(pm => pm.id === methodId);
    if (index === -1) return null;
    
    this.paymentMethods[index] = {
      ...this.paymentMethods[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.paymentMethods[index];
  }

  async deletePaymentMethod(methodId: string): Promise<boolean> {
    const index = this.paymentMethods.findIndex(pm => pm.id === methodId);
    if (index === -1) return false;
    
    this.paymentMethods.splice(index, 1);
    return true;
  }

  // Rent Payments
  async getRentPayments(tenantId?: string, propertyId?: string): Promise<RentPayment[]> {
    let filtered = this.payments;
    if (tenantId) filtered = filtered.filter(p => p.tenantId === tenantId);
    if (propertyId) filtered = filtered.filter(p => p.propertyId === propertyId);
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createRentPayment(payment: Omit<RentPayment, 'id' | 'createdAt' | 'updatedAt'>): Promise<RentPayment> {
    const newPayment: RentPayment = {
      ...payment,
      id: `pay_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.payments.push(newPayment);
    return newPayment;
  }

  async processPayment(paymentId: string, paymentMethodId: string): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    const payment = this.payments.find(p => p.id === paymentId);
    if (!payment) return { success: false, error: 'Payment not found' };

    const paymentMethod = this.paymentMethods.find(pm => pm.id === paymentMethodId);
    if (!paymentMethod) return { success: false, error: 'Payment method not found' };

    // Simulate payment processing
    const transactionId = `txn_${Date.now()}`;
    
    // Update payment status
    payment.status = 'processing';
    payment.paymentMethodId = paymentMethodId;
    payment.transactionId = transactionId;
    payment.updatedAt = new Date().toISOString();

    // Simulate processing delay and outcome
    setTimeout(() => {
      const success = Math.random() > 0.05; // 95% success rate
      payment.status = success ? 'completed' : 'failed';
      if (success) {
        payment.paidDate = new Date().toISOString();
        payment.confirmationCode = `conf_${Date.now()}`;
      }
      payment.updatedAt = new Date().toISOString();
    }, 2000);

    return { success: true, transactionId };
  }

  async recordCashPayment(paymentId: string, locationId: string, confirmationCode: string): Promise<boolean> {
    const payment = this.payments.find(p => p.id === paymentId);
    if (!payment) return false;

    const location = this.cashLocations.find(l => l.id === locationId);
    if (!location) return false;

    payment.status = 'completed';
    payment.paidDate = new Date().toISOString();
    payment.confirmationCode = confirmationCode;
    payment.processedBy = location.name;
    payment.updatedAt = new Date().toISOString();

    return true;
  }

  // Payment Schedules
  async getPaymentSchedule(tenantId: string): Promise<PaymentSchedule | null> {
    return this.schedules.find(s => s.tenantId === tenantId && s.isActive) || null;
  }

  async createPaymentSchedule(schedule: Omit<PaymentSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentSchedule> {
    const newSchedule: PaymentSchedule = {
      ...schedule,
      id: `sched_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.schedules.push(newSchedule);
    return newSchedule;
  }

  // Cash Payment Locations
  async getCashPaymentLocations(zipCode?: string): Promise<CashPaymentLocation[]> {
    let locations = this.cashLocations.filter(l => l.isActive);
    if (zipCode) {
      // Simple distance-based filtering (in real app, use geolocation)
      locations = locations.filter(l => l.zipCode.startsWith(zipCode.substring(0, 3)));
    }
    return locations;
  }

  // Payment Reminders
  async createPaymentReminder(reminder: Omit<PaymentReminder, 'id' | 'createdAt'>): Promise<PaymentReminder> {
    const newReminder: PaymentReminder = {
      ...reminder,
      id: `rem_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.reminders.push(newReminder);
    return newReminder;
  }

  async sendPaymentReminders(): Promise<{ sent: number; failed: number }> {
    const unsent = this.reminders.filter(r => !r.sent);
    let sent = 0;
    let failed = 0;

    for (const reminder of unsent) {
      try {
        // Simulate sending reminder
        await this.simulateSendReminder(reminder);
        reminder.sent = true;
        reminder.sentAt = new Date().toISOString();
        sent++;
      } catch (error) {
        failed++;
      }
    }

    return { sent, failed };
  }

  // Auto Pay
  async setupAutoPay(setup: Omit<AutoPaySetup, 'id' | 'createdAt' | 'updatedAt'>): Promise<AutoPaySetup> {
    const newSetup: AutoPaySetup = {
      ...setup,
      id: `auto_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.autoPaySetups.push(newSetup);
    return newSetup;
  }

  async getAutoPaySetup(tenantId: string): Promise<AutoPaySetup | null> {
    return this.autoPaySetups.find(s => s.tenantId === tenantId && s.isActive) || null;
  }

  // Reports
  async generatePaymentReport(period: PaymentReport['period'], startDate: string, endDate: string): Promise<PaymentReport> {
    const paymentsInPeriod = this.payments.filter(p => 
      new Date(p.createdAt) >= new Date(startDate) && 
      new Date(p.createdAt) <= new Date(endDate)
    );

    const totalCollected = paymentsInPeriod
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalDue = paymentsInPeriod.reduce((sum, p) => sum + p.amount, 0);

    const collectionRate = totalDue > 0 ? (totalCollected / totalDue) * 100 : 0;

    const paymentMethodBreakdown = paymentsInPeriod
      .filter(p => p.status === 'completed' && p.paymentMethodId)
      .reduce((acc, p) => {
        const method = this.paymentMethods.find(m => m.id === p.paymentMethodId);
        if (method) {
          acc[method.type] = (acc[method.type] || 0) + p.amount;
        }
        return acc;
      }, {} as Record<string, number>);

    const latePayments = paymentsInPeriod.filter(p => 
      p.paidDate && new Date(p.paidDate) > new Date(p.dueDate)
    ).length;

    return {
      period,
      startDate,
      endDate,
      totalCollected,
      totalDue,
      collectionRate,
      paymentMethodBreakdown,
      latePayments,
      averageDaysLate: 0, // Calculate based on actual late payments
      topPerformingProperties: [],
      underperformingTenants: []
    };
  }

  // Private methods
  private async simulateSendReminder(reminder: PaymentReminder): Promise<void> {
    // Simulate API call to send reminder
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (Math.random() < 0.95) { // 95% success rate
      return Promise.resolve();
    } else {
      throw new Error('Failed to send reminder');
    }
  }

  private initializeMockData(): void {
    // Initialize with sample cash payment locations
    this.cashLocations = [
      {
        id: 'loc_western_union_1',
        provider: 'western_union',
        name: 'Western Union - Main Street',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        phone: '(555) 123-4567',
        hours: '9 AM - 8 PM',
        fees: 295, // $2.95
        isActive: true,
        coordinates: { lat: 40.7589, lng: -73.9851 }
      },
      {
        id: 'loc_walmart_1',
        provider: 'walmart',
        name: 'Walmart Supercenter',
        address: '456 Commerce Blvd',
        city: 'New York',
        state: 'NY',
        zipCode: '10002',
        phone: '(555) 987-6543',
        hours: '24 Hours',
        fees: 188, // $1.88
        isActive: true,
        coordinates: { lat: 40.7505, lng: -73.9934 }
      },
      {
        id: 'loc_moneygram_1',
        provider: 'moneygram',
        name: 'CVS Pharmacy - MoneyGram',
        address: '789 Broadway',
        city: 'New York',
        state: 'NY',
        zipCode: '10003',
        phone: '(555) 456-7890',
        hours: '8 AM - 10 PM',
        fees: 199, // $1.99
        isActive: true,
        coordinates: { lat: 40.7282, lng: -73.9942 }
      }
    ];

    // Initialize with sample payment processors
    this.processors = [
      {
        id: 'proc_stripe',
        name: 'Stripe',
        type: 'stripe',
        isActive: true,
        supportedMethods: ['card', 'ach', 'bank_transfer'],
        fees: {
          card: 2.9, // 2.9%
          ach: 80, // $0.80
          bank_transfer: 25 // $0.25
        },
        credentials: {}
      },
      {
        id: 'proc_dwolla',
        name: 'Dwolla',
        type: 'dwolla',
        isActive: true,
        supportedMethods: ['ach', 'bank_transfer'],
        fees: {
          card: 0,
          ach: 25, // $0.25
          bank_transfer: 5 // $0.05
        },
        credentials: {}
      }
    ];
  }
}

export const paymentService = PaymentService.getInstance();
