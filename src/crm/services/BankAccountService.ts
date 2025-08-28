import { 
  BankConnection, 
  BankVerification, 
  BankTransaction, 
  BusinessBankAccount, 
  PlaidLinkResult, 
  ACHProcessingResult,
  BankAccountValidation,
  PaymentRoute
} from '../types/BankAccountTypes';

interface NeonDatabaseConfig {
  host: string;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
}

export class BankAccountService {
  private static instance: BankAccountService;
  private bankConnections: BankConnection[] = [];
  private businessAccounts: BusinessBankAccount[] = [];
  private transactions: BankTransaction[] = [];
  private verifications: BankVerification[] = [];
  private paymentRoutes: PaymentRoute[] = [];

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): BankAccountService {
    if (!BankAccountService.instance) {
      BankAccountService.instance = new BankAccountService();
    }
    return BankAccountService.instance;
  }

  // Bank Connection Management
  async connectBankAccount(
    tenantId: string, 
    plaidResult: PlaidLinkResult,
    selectedAccountId: string
  ): Promise<BankConnection> {
    // In production, this would:
    // 1. Exchange public token for access token via secure backend
    // 2. Fetch account details from Plaid
    // 3. Store encrypted tokens in Neon database
    // 4. Initiate verification process

    const selectedAccount = plaidResult.metadata.accounts.find(
      acc => acc.id === selectedAccountId
    );

    if (!selectedAccount) {
      throw new Error('Selected account not found');
    }

    const bankConnection: BankConnection = {
      id: `bank_${Date.now()}`,
      tenantId,
      bankName: plaidResult.metadata.institution.name,
      accountType: selectedAccount.subtype as 'checking' | 'savings',
      accountNumber: `****${selectedAccount.mask}`, // Tokenized
      routingNumber: '021000021', // Would come from Plaid
      accountHolderName: 'Account Holder', // Would come from Plaid Identity
      isVerified: false,
      verificationStatus: 'pending',
      verificationMethod: 'plaid',
      plaidAccountId: selectedAccount.id,
      plaidAccessToken: 'encrypted_access_token', // Encrypted in production
      isActive: true,
      isDefault: this.bankConnections.length === 0,
      permissions: [
        { type: 'read', granted: true },
        { type: 'debit', granted: true }
      ],
      riskScore: 25, // Low risk
      dailyLimit: 500000, // $5,000 in cents
      monthlyLimit: 10000000, // $100,000 in cents
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.bankConnections.push(bankConnection);

    // Start verification process
    await this.initiateVerification(bankConnection.id, 'instant');

    return bankConnection;
  }

  async getBankConnections(tenantId: string): Promise<BankConnection[]> {
    return this.bankConnections.filter(conn => conn.tenantId === tenantId);
  }

  async getBankConnection(connectionId: string): Promise<BankConnection | null> {
    return this.bankConnections.find(conn => conn.id === connectionId) || null;
  }

  async updateBankConnection(
    connectionId: string, 
    updates: Partial<BankConnection>
  ): Promise<BankConnection | null> {
    const index = this.bankConnections.findIndex(conn => conn.id === connectionId);
    if (index === -1) return null;

    this.bankConnections[index] = {
      ...this.bankConnections[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.bankConnections[index];
  }

  async deleteBankConnection(connectionId: string): Promise<boolean> {
    const index = this.bankConnections.findIndex(conn => conn.id === connectionId);
    if (index === -1) return false;

    // In production, securely revoke access tokens
    this.bankConnections.splice(index, 1);
    return true;
  }

  // Bank Verification
  async initiateVerification(
    connectionId: string, 
    method: 'micro_deposits' | 'instant' | 'manual'
  ): Promise<BankVerification> {
    const verification: BankVerification = {
      id: `verify_${Date.now()}`,
      bankConnectionId: connectionId,
      method,
      status: method === 'instant' ? 'completed' : 'pending',
      attempts: 0,
      maxAttempts: 3,
      microDeposits: method === 'micro_deposits' ? [
        {
          amount: 11, // $0.11
          description: 'PLAID TEST 1',
          status: 'sent',
          sentAt: new Date().toISOString()
        },
        {
          amount: 32, // $0.32
          description: 'PLAID TEST 2',
          status: 'sent',
          sentAt: new Date().toISOString()
        }
      ] : undefined,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      createdAt: new Date().toISOString()
    };

    this.verifications.push(verification);

    // Auto-verify for instant method
    if (method === 'instant') {
      await this.completeVerification(verification.id);
    }

    return verification;
  }

  async verifyMicroDeposits(
    verificationId: string, 
    amounts: number[]
  ): Promise<{ success: boolean; error?: string }> {
    const verification = this.verifications.find(v => v.id === verificationId);
    if (!verification) {
      return { success: false, error: 'Verification not found' };
    }

    if (verification.status !== 'pending') {
      return { success: false, error: 'Verification not in pending state' };
    }

    verification.attempts++;

    // Check if amounts match
    const expectedAmounts = verification.microDeposits?.map(d => d.amount) || [];
    const isValid = amounts.length === expectedAmounts.length && 
      amounts.every((amount, index) => amount === expectedAmounts[index]);

    if (isValid) {
      await this.completeVerification(verificationId);
      return { success: true };
    } else {
      if (verification.attempts >= verification.maxAttempts) {
        verification.status = 'failed';
        verification.failureReason = 'Maximum verification attempts exceeded';
      }
      return { success: false, error: 'Incorrect amounts provided' };
    }
  }

  private async completeVerification(verificationId: string): Promise<void> {
    const verification = this.verifications.find(v => v.id === verificationId);
    if (!verification) return;

    verification.status = 'completed';
    verification.completedAt = new Date().toISOString();

    // Update bank connection
    await this.updateBankConnection(verification.bankConnectionId, {
      isVerified: true,
      verificationStatus: 'verified'
    });
  }

  // ACH Processing
  async processACHPayment(
    connectionId: string, 
    amount: number, 
    description: string,
    businessAccountId: string
  ): Promise<ACHProcessingResult> {
    const connection = await this.getBankConnection(connectionId);
    if (!connection) {
      throw new Error('Bank connection not found');
    }

    if (!connection.isVerified) {
      throw new Error('Bank account not verified');
    }

    // Validate limits
    if (connection.dailyLimit && amount > connection.dailyLimit) {
      throw new Error('Amount exceeds daily limit');
    }

    const transaction: BankTransaction = {
      id: `ach_${Date.now()}`,
      bankConnectionId: connectionId,
      type: 'debit',
      amount,
      description,
      reference: `REF${Date.now()}`,
      status: 'pending',
      achTransactionId: `ACH${Date.now()}`,
      effectiveDate: this.getNextBusinessDay(),
      createdAt: new Date().toISOString()
    };

    this.transactions.push(transaction);

    // Simulate processing
    setTimeout(() => {
      transaction.status = 'processing';
      transaction.processedAt = new Date().toISOString();
      
      setTimeout(() => {
        transaction.status = Math.random() > 0.05 ? 'completed' : 'failed';
        if (transaction.status === 'failed') {
          transaction.failureReason = 'Insufficient funds';
        }
      }, 2000);
    }, 1000);

    return {
      transactionId: transaction.id,
      status: transaction.status,
      amount,
      effectiveDate: transaction.effectiveDate,
      processingFee: Math.round(amount * 0.0075), // 0.75% fee
      estimatedSettlement: this.getSettlementDate(transaction.effectiveDate),
      error: transaction.failureReason
    };
  }

  // Business Bank Account Management
  async addBusinessBankAccount(account: Omit<BusinessBankAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<BusinessBankAccount> {
    const businessAccount: BusinessBankAccount = {
      ...account,
      id: `biz_bank_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.businessAccounts.push(businessAccount);
    return businessAccount;
  }

  async getBusinessBankAccounts(organizationId: string): Promise<BusinessBankAccount[]> {
    return this.businessAccounts.filter(acc => acc.organizationId === organizationId);
  }

  // Payment Routing
  async createPaymentRoute(route: Omit<PaymentRoute, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentRoute> {
    const paymentRoute: PaymentRoute = {
      ...route,
      id: `route_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.paymentRoutes.push(paymentRoute);
    return paymentRoute;
  }

  async getPaymentRoutes(): Promise<PaymentRoute[]> {
    return this.paymentRoutes.sort((a, b) => a.priority - b.priority);
  }

  // Bank Account Validation
  async validateBankAccount(routingNumber: string, accountNumber: string): Promise<BankAccountValidation> {
    // In production, use bank validation services
    const isValidRouting = this.validateRoutingNumber(routingNumber);
    const isValidAccount = accountNumber.length >= 4 && accountNumber.length <= 17;

    return {
      routingNumber: {
        isValid: isValidRouting,
        bankName: isValidRouting ? 'Sample Bank' : undefined,
        achParticipant: isValidRouting,
        wireParticipant: isValidRouting
      },
      accountNumber: {
        isValid: isValidAccount,
        format: isValidAccount ? 'valid' : 'invalid'
      },
      riskFlags: []
    };
  }

  // Utility Methods
  private validateRoutingNumber(routingNumber: string): boolean {
    if (routingNumber.length !== 9 || !/^\d{9}$/.test(routingNumber)) {
      return false;
    }

    // ABA routing number checksum validation
    const digits = routingNumber.split('').map(Number);
    const checksum = (
      3 * (digits[0] + digits[3] + digits[6]) +
      7 * (digits[1] + digits[4] + digits[7]) +
      1 * (digits[2] + digits[5] + digits[8])
    ) % 10;

    return checksum === 0;
  }

  private getNextBusinessDay(): string {
    const today = new Date();
    let nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);

    // Skip weekends
    while (nextDay.getDay() === 0 || nextDay.getDay() === 6) {
      nextDay.setDate(nextDay.getDate() + 1);
    }

    return nextDay.toISOString().split('T')[0];
  }

  private getSettlementDate(effectiveDate: string): string {
    const effective = new Date(effectiveDate);
    const settlement = new Date(effective);
    settlement.setDate(effective.getDate() + 2); // T+2 settlement

    // Skip weekends
    while (settlement.getDay() === 0 || settlement.getDay() === 6) {
      settlement.setDate(settlement.getDate() + 1);
    }

    return settlement.toISOString().split('T')[0];
  }

  private initializeMockData(): void {
    // Initialize with sample business bank account
    this.businessAccounts.push({
      id: 'biz_bank_main',
      organizationId: 'org_main',
      bankName: 'Chase Business Banking',
      accountType: 'business_checking',
      accountNumber: '****1234',
      routingNumber: '021000021',
      accountHolderName: 'Property Management LLC',
      businessName: 'Property Management LLC',
      taxId: '**-*7890',
      isVerified: true,
      isPrimary: true,
      canReceivePayments: true,
      canSendPayments: true,
      dailyReceiveLimit: 10000000, // $100,000
      monthlyReceiveLimit: 300000000, // $3,000,000
      fees: {
        achReceive: 0, // Free
        achSend: 25, // $0.25
        wireReceive: 1500, // $15.00
        wireSend: 3000, // $30.00
        monthlyMaintenance: 1200, // $12.00
        overdraftFee: 3500 // $35.00
      },
      processingSchedule: {
        achDebitDays: [1, 2, 3, 4, 5], // Monday-Friday
        achCreditDays: [1, 2, 3, 4, 5],
        cutoffTime: '17:00', // 5 PM EST
        timezone: 'America/New_York',
        holidays: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Initialize default payment route
    this.paymentRoutes.push({
      id: 'route_default',
      name: 'Default Rent Collection Route',
      businessBankAccountId: 'biz_bank_main',
      routingRules: [
        {
          condition: 'payment_amount',
          operator: 'greater_than',
          value: 0,
          bankAccountId: 'biz_bank_main'
        }
      ],
      isActive: true,
      priority: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
}

export const bankAccountService = BankAccountService.getInstance();
