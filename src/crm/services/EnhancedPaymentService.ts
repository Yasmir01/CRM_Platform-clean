import {
  RentPayment,
  PaymentMethod,
  PaymentSchedule,
  PaymentReminder,
  CashPaymentLocation,
  PaymentProcessor,
  AutoPaySetup,
  PaymentDispute,
  PaymentReport,
  PaymentFee
} from '../types/PaymentTypes';
import {
  BankConnection,
  BankTransaction,
  BusinessBankAccount,
  ACHProcessingResult,
  PaymentRoute,
  EnhancedPaymentMethod
} from '../types/BankAccountTypes';
import { bankAccountService } from './BankAccountService';
import { securityMiddleware } from '../utils/advancedSecurity';
import { PCIComplianceValidator } from '../utils/pciComplianceValidator';
import { PaymentEncryption } from '../utils/paymentSecurity';

interface PaymentRoutingResult {
  selectedRoute: PaymentRoute;
  businessBankAccount: BusinessBankAccount;
  processingFee: number;
  estimatedSettlement: string;
}

export class EnhancedPaymentService {
  private static instance: EnhancedPaymentService;
  private payments: RentPayment[] = [];
  private paymentMethods: EnhancedPaymentMethod[] = [];
  private schedules: PaymentSchedule[] = [];
  private reminders: PaymentReminder[] = [];
  private processors: PaymentProcessor[] = [];
  private cashLocations: CashPaymentLocation[] = [];
  private autoPaySetups: AutoPaySetup[] = [];
  private disputes: PaymentDispute[] = [];
  private bankTransactions: BankTransaction[] = [];

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): EnhancedPaymentService {
    if (!EnhancedPaymentService.instance) {
      EnhancedPaymentService.instance = new EnhancedPaymentService();
    }
    return EnhancedPaymentService.instance;
  }

  // Enhanced Payment Methods with Bank Integration
  async getPaymentMethods(tenantId: string): Promise<EnhancedPaymentMethod[]> {
    const regularMethods = this.paymentMethods.filter(pm => pm.id.includes(tenantId));
    
    // Add bank account payment methods
    const bankConnections = await bankAccountService.getBankConnections(tenantId);
    const bankMethods: EnhancedPaymentMethod[] = bankConnections
      .filter(conn => conn.isVerified && conn.isActive)
      .map(conn => ({
        id: `bank_${conn.id}`,
        type: 'ach' as const,
        name: `${conn.bankName} ${conn.accountType}`,
        details: {
          bankName: conn.bankName,
          accountType: conn.accountType,
          last4: conn.accountNumber.slice(-4),
          routingNumber: conn.routingNumber
        },
        isDefault: conn.isDefault,
        isActive: true,
        bankConnectionId: conn.id,
        processingFee: this.calculateACHFee(0), // Will be calculated based on amount
        processingTime: '1-3 business days',
        limits: {
          daily: conn.dailyLimit || 500000, // $5,000
          monthly: conn.monthlyLimit || 10000000, // $100,000
          perTransaction: Math.min(conn.dailyLimit || 500000, 100000) // $1,000 max per transaction
        },
        createdAt: conn.createdAt,
        updatedAt: conn.updatedAt
      }));

    return [...regularMethods, ...bankMethods];
  }

  async addBankPaymentMethod(tenantId: string, bankConnectionId: string): Promise<EnhancedPaymentMethod> {
    const bankConnection = await bankAccountService.getBankConnection(bankConnectionId);
    if (!bankConnection) {
      throw new Error('Bank connection not found');
    }

    if (!bankConnection.isVerified) {
      throw new Error('Bank account must be verified before use');
    }

    const bankMethod: EnhancedPaymentMethod = {
      id: `bank_${bankConnectionId}`,
      type: 'ach',
      name: `${bankConnection.bankName} ${bankConnection.accountType}`,
      details: {
        bankName: bankConnection.bankName,
        accountType: bankConnection.accountType,
        last4: bankConnection.accountNumber.slice(-4),
        routingNumber: bankConnection.routingNumber
      },
      isDefault: bankConnection.isDefault,
      isActive: true,
      bankConnectionId: bankConnectionId,
      processingFee: this.calculateACHFee(0),
      processingTime: '1-3 business days',
      limits: {
        daily: bankConnection.dailyLimit || 500000,
        monthly: bankConnection.monthlyLimit || 10000000,
        perTransaction: Math.min(bankConnection.dailyLimit || 500000, 100000)
      },
      createdAt: bankConnection.createdAt,
      updatedAt: bankConnection.updatedAt
    };

    return bankMethod;
  }

  // Enhanced Payment Processing with Bank Account Support
  async processPayment(
    paymentId: string, 
    paymentMethodId: string,
    options?: {
      businessBankAccountId?: string;
      bypassRouting?: boolean;
    }
  ): Promise<{ success: boolean; transactionId?: string; error?: string; achResult?: ACHProcessingResult }> {
    const payment = this.payments.find(p => p.id === paymentId);
    if (!payment) return { success: false, error: 'Payment not found' };

    // Check if this is a bank payment method
    if (paymentMethodId.startsWith('bank_')) {
      return await this.processBankPayment(payment, paymentMethodId, options);
    }

    // Fall back to original payment processing for cards and other methods
    return await this.processRegularPayment(payment, paymentMethodId);
  }

  private async processBankPayment(
    payment: RentPayment, 
    paymentMethodId: string,
    options?: {
      businessBankAccountId?: string;
      bypassRouting?: boolean;
    }
  ): Promise<{ success: boolean; transactionId?: string; error?: string; achResult?: ACHProcessingResult }> {
    const bankConnectionId = paymentMethodId.replace('bank_', '');
    const bankConnection = await bankAccountService.getBankConnection(bankConnectionId);
    
    if (!bankConnection) {
      return { success: false, error: 'Bank connection not found' };
    }

    if (!bankConnection.isVerified) {
      return { success: false, error: 'Bank account not verified' };
    }

    // Validate payment amount against limits
    const paymentMethod = await this.addBankPaymentMethod(payment.tenantId, bankConnectionId);
    if (paymentMethod.limits) {
      if (payment.amount > paymentMethod.limits.perTransaction) {
        return { 
          success: false, 
          error: `Payment amount exceeds transaction limit of $${paymentMethod.limits.perTransaction / 100}` 
        };
      }
    }

    // Determine routing - check property assignment first
    let businessBankAccountId = options?.businessBankAccountId;

    // Check if property has an assigned business bank account
    if (!businessBankAccountId && payment.propertyId) {
      try {
        // In production, this would fetch from the database
        // For now, we'll check localStorage via a helper method
        const propertyBankAccount = await this.getPropertyBankAccount(payment.propertyId);
        if (propertyBankAccount) {
          businessBankAccountId = propertyBankAccount;
        }
      } catch (error) {
        console.warn('Failed to get property bank account assignment:', error);
      }
    }

    if (!businessBankAccountId && !options?.bypassRouting) {
      const routing = await this.determinePaymentRoute(payment);
      businessBankAccountId = routing.businessBankAccount.id;
    }

    if (!businessBankAccountId) {
      // Use default business account
      const businessAccounts = await bankAccountService.getBusinessBankAccounts('org_main');
      const primaryAccount = businessAccounts.find(acc => acc.isPrimary);
      if (!primaryAccount) {
        return { success: false, error: 'No business bank account configured' };
      }
      businessBankAccountId = primaryAccount.id;
    }

    try {
      // Process ACH payment
      const achResult = await bankAccountService.processACHPayment(
        bankConnectionId,
        payment.amount,
        `Rent payment for ${payment.propertyId}`,
        businessBankAccountId
      );

      // Update payment status
      const transactionId = achResult.transactionId;
      payment.status = 'processing';
      payment.transactionId = transactionId;
      payment.paymentMethodId = paymentMethodId;
      payment.processedBy = 'system';
      payment.updatedAt = new Date().toISOString();

      // Add processing fee
      if (achResult.processingFee > 0) {
        const fee: PaymentFee = {
          id: `fee_${Date.now()}`,
          type: 'processing',
          amount: achResult.processingFee,
          description: 'ACH Processing Fee'
        };
        payment.fees.push(fee);
      }

      // Create bank transaction record
      const bankTransaction: BankTransaction = {
        id: transactionId,
        bankConnectionId,
        type: 'debit',
        amount: payment.amount,
        description: `Rent payment ${payment.id}`,
        reference: payment.id,
        status: achResult.status,
        achTransactionId: transactionId,
        effectiveDate: achResult.effectiveDate,
        createdAt: new Date().toISOString()
      };
      this.bankTransactions.push(bankTransaction);

      // Simulate status updates
      setTimeout(() => {
        payment.status = Math.random() > 0.05 ? 'completed' : 'failed';
        bankTransaction.status = payment.status;
        
        if (payment.status === 'completed') {
          payment.paidDate = new Date().toISOString();
          bankTransaction.processedAt = new Date().toISOString();
        } else {
          payment.status = 'failed';
          bankTransaction.status = 'failed';
          bankTransaction.failureReason = 'Insufficient funds';
        }
      }, 3000);

      return { 
        success: true, 
        transactionId, 
        achResult 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Payment processing failed' 
      };
    }
  }

  private async processRegularPayment(
    payment: RentPayment, 
    paymentMethodId: string
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    const paymentMethod = this.paymentMethods.find(pm => pm.id === paymentMethodId);
    if (!paymentMethod) return { success: false, error: 'Payment method not found' };

    // Simulate payment processing
    const transactionId = `txn_${Date.now()}`;
    
    payment.status = 'processing';
    payment.transactionId = transactionId;
    payment.paymentMethodId = paymentMethodId;
    payment.processedBy = 'system';
    payment.updatedAt = new Date().toISOString();

    // Simulate processing delay and outcome
    setTimeout(() => {
      payment.status = Math.random() > 0.05 ? 'completed' : 'failed';
      if (payment.status === 'completed') {
        payment.paidDate = new Date().toISOString();
      }
    }, 2000);

    return { success: true, transactionId };
  }

  // Payment Routing Logic
  async determinePaymentRoute(payment: RentPayment): Promise<PaymentRoutingResult> {
    const routes = await bankAccountService.getPaymentRoutes();
    const businessAccounts = await bankAccountService.getBusinessBankAccounts('org_main');

    // Find matching route based on rules
    let selectedRoute = routes.find(route => {
      return route.isActive && this.evaluateRoutingRules(route, payment);
    });

    // Fallback to default route
    if (!selectedRoute) {
      selectedRoute = routes.find(route => route.isActive && route.name.includes('Default'));
    }

    if (!selectedRoute) {
      throw new Error('No active payment route configured');
    }

    const businessBankAccount = businessAccounts.find(acc => acc.id === selectedRoute.businessBankAccountId);
    if (!businessBankAccount) {
      throw new Error('Business bank account not found for route');
    }

    const processingFee = this.calculateACHFee(payment.amount);
    const estimatedSettlement = this.calculateSettlementDate();

    return {
      selectedRoute,
      businessBankAccount,
      processingFee,
      estimatedSettlement
    };
  }

  private evaluateRoutingRules(route: PaymentRoute, payment: RentPayment): boolean {
    return route.routingRules.every(rule => {
      switch (rule.condition) {
        case 'payment_amount':
          const amount = payment.amount;
          switch (rule.operator) {
            case 'greater_than':
              return amount > (rule.value as number);
            case 'less_than':
              return amount < (rule.value as number);
            case 'equals':
              return amount === (rule.value as number);
            default:
              return false;
          }
        
        case 'property_type':
          // Would need property data to evaluate
          return true;
        
        case 'tenant_risk':
          // Would need tenant risk score to evaluate
          return true;
        
        case 'payment_method':
          return (rule.value as string[]).includes(payment.paymentMethodId || '');
        
        case 'time_of_day':
          const hour = new Date().getHours();
          return hour >= 9 && hour <= 17; // Business hours
        
        default:
          return true;
      }
    });
  }

  // Fee Calculations
  private calculateACHFee(amount: number): number {
    // ACH fees are typically flat rate or percentage-based with caps
    const flatFee = 75; // $0.75
    const percentageFee = Math.round(amount * 0.0075); // 0.75%
    const maxFee = 500; // $5.00 cap
    
    return Math.min(Math.max(flatFee, percentageFee), maxFee);
  }

  private calculateSettlementDate(): string {
    const today = new Date();
    const settlement = new Date(today);
    settlement.setDate(today.getDate() + 2); // T+2 for ACH
    
    // Skip weekends
    while (settlement.getDay() === 0 || settlement.getDay() === 6) {
      settlement.setDate(settlement.getDate() + 1);
    }
    
    return settlement.toISOString().split('T')[0];
  }

  // Bank Transaction History
  async getBankTransactions(tenantId?: string, bankConnectionId?: string): Promise<BankTransaction[]> {
    let filtered = this.bankTransactions;
    
    if (bankConnectionId) {
      filtered = filtered.filter(tx => tx.bankConnectionId === bankConnectionId);
    }
    
    // If filtering by tenant, cross-reference with payments
    if (tenantId) {
      const tenantPayments = this.payments.filter(p => p.tenantId === tenantId);
      const paymentIds = tenantPayments.map(p => p.id);
      filtered = filtered.filter(tx => paymentIds.includes(tx.reference));
    }
    
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Auto-Pay with Bank Accounts
  async setupAutoPayWithBank(setup: Omit<AutoPaySetup, 'id' | 'createdAt' | 'updatedAt'> & { bankConnectionId: string }): Promise<AutoPaySetup> {
    // Verify bank connection
    const bankConnection = await bankAccountService.getBankConnection(setup.bankConnectionId);
    if (!bankConnection || !bankConnection.isVerified) {
      throw new Error('Bank account must be verified for auto-pay');
    }

    // Create payment method reference
    const paymentMethodId = `bank_${setup.bankConnectionId}`;

    const autoPaySetup: AutoPaySetup = {
      ...setup,
      id: `autopay_${Date.now()}`,
      paymentMethodId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.autoPaySetups.push(autoPaySetup);
    return autoPaySetup;
  }

  // Existing methods (unchanged)
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

  /**
   * Get property-assigned business bank account
   */
  private async getPropertyBankAccount(propertyId: string): Promise<string | null> {
    try {
      // Get property data from localStorage (in production this would be from Neon database)
      const properties = JSON.parse(localStorage.getItem('crm_properties') || '[]');
      const property = properties.find((p: any) => p.id === propertyId);
      return property?.assignedBusinessBankAccountId || null;
    } catch (error) {
      console.error('Error fetching property bank account:', error);
      return null;
    }
  }

  // Initialize mock data
  private initializeMockData(): void {
    // Add sample payments
    this.payments = [
      {
        id: 'pay_sample_1',
        tenantId: 'tenant_1',
        propertyId: 'prop_1',
        amount: 150000, // $1,500
        dueDate: '2024-02-01',
        status: 'completed',
        paidDate: '2024-02-01',
        paymentMethodId: 'bank_sample',
        transactionId: 'ach_sample_1',
        fees: [{
          id: 'fee_1',
          type: 'processing',
          amount: 75,
          description: 'ACH Processing Fee'
        }],
        confirmationCode: 'CONF123456',
        processedBy: 'system',
        createdAt: '2024-02-01T00:00:00Z',
        updatedAt: '2024-02-01T00:00:00Z'
      }
    ];

    // Add sample processors
    this.processors = [
      {
        id: 'stripe',
        name: 'Stripe',
        type: 'stripe',
        isActive: true,
        supportedMethods: ['card', 'ach', 'bank_transfer'],
        fees: {
          card: 2.9,
          ach: 75,
          bank_transfer: 75
        },
        credentials: {
          publishableKey: 'pk_test_...',
          secretKey: 'sk_test_...'
        }
      },
      {
        id: 'dwolla',
        name: 'Dwolla',
        type: 'dwolla',
        isActive: true,
        supportedMethods: ['ach', 'bank_transfer'],
        fees: {
          card: 0,
          ach: 50,
          bank_transfer: 50
        },
        credentials: {
          key: 'dwolla_key',
          secret: 'dwolla_secret',
          environment: 'sandbox'
        }
      }
    ];
  }
}

export const enhancedPaymentService = EnhancedPaymentService.getInstance();
