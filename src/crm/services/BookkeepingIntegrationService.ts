/**
 * Comprehensive Bookkeeping Integration Service
 * 
 * Provides unified interface for integrating with major bookkeeping/accounting software
 * including Xero, QuickBooks, Sage, FreshBooks, Wave, and others.
 */

import { RentPayment, PaymentFee, PaymentMethod } from '../types/PaymentTypes';
import { LedgerEntry, TenantFinancialProfile } from '../types/TenantFinancialTypes';

export interface BookkeepingProvider {
  id: string;
  name: string;
  type: 'xero' | 'quickbooks' | 'sage' | 'freshbooks' | 'wave' | 'zoho' | 'accountingpods' | 'buildium' | 'appfolio' | 'custom';
  authType: 'oauth2' | 'api_key' | 'username_password';
  baseUrl: string;
  scopes?: string[];
  features: BookkeepingFeature[];
  limits: {
    rateLimit: number; // requests per minute
    maxRetries: number;
    timeout: number; // milliseconds
  };
}

export type BookkeepingFeature = 
  | 'invoices' 
  | 'payments' 
  | 'customers' 
  | 'vendors' 
  | 'bank_transactions'
  | 'journal_entries'
  | 'financial_reports'
  | 'tax_tracking'
  | 'multi_currency'
  | 'recurring_invoices'
  | 'bill_management'
  | 'expense_tracking'
  | 'inventory'
  | 'payroll';

export interface BookkeepingConnection {
  id: string;
  providerId: string;
  tenantId: string; // Your organization/tenant ID
  isActive: boolean;
  credentials: BookkeepingCredentials;
  configuration: BookkeepingConfiguration;
  lastSync: string;
  syncStatus: 'active' | 'paused' | 'error' | 'disconnected';
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookkeepingCredentials {
  // OAuth2 credentials
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: string;
  
  // API Key credentials
  apiKey?: string;
  apiSecret?: string;
  
  // Username/Password credentials
  username?: string;
  password?: string;
  
  // Provider-specific
  companyId?: string;
  organizationId?: string;
  subscriptionKey?: string;
  sandboxMode?: boolean;
}

export interface BookkeepingConfiguration {
  syncFrequency: 'real_time' | 'hourly' | 'daily' | 'weekly' | 'manual';
  syncDirection: 'one_way_to_bookkeeping' | 'one_way_from_bookkeeping' | 'bidirectional';
  enabledFeatures: BookkeepingFeature[];
  
  // Data mapping configuration
  accountMappings: {
    rentIncomeAccount?: string;
    securityDepositAccount?: string;
    lateFeeAccount?: string;
    maintenanceExpenseAccount?: string;
    bankAccount?: string;
    receivablesAccount?: string;
    payablesAccount?: string;
  };
  
  // Customer/Contact mapping
  customerPrefix?: string;
  vendorPrefix?: string;
  
  // Invoice settings
  invoiceTemplate?: string;
  invoiceNumberPrefix?: string;
  paymentTerms?: number; // days
  
  // Sync preferences
  createMissingAccounts: boolean;
  createMissingCustomers: boolean;
  syncHistoricalData: boolean;
  historicalDataStartDate?: string;
}

export interface BookkeepingInvoice {
  id?: string;
  externalId?: string;
  customerId: string;
  customerName: string;
  invoiceNumber?: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  taxAmount?: number;
  discountAmount?: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  lineItems: BookkeepingLineItem[];
  description?: string;
  reference?: string;
  paymentTerms?: number;
  currency?: string;
}

export interface BookkeepingLineItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  taxRate?: number;
  accountCode?: string;
  trackingCategory?: string;
}

export interface BookkeepingPayment {
  id?: string;
  externalId?: string;
  customerId: string;
  invoiceId?: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference?: string;
  bankAccount?: string;
  description?: string;
  currency?: string;
}

export interface BookkeepingCustomer {
  id?: string;
  externalId?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  taxNumber?: string;
  paymentTerms?: number;
  creditLimit?: number;
  isActive: boolean;
}

export interface BookkeepingJournalEntry {
  id?: string;
  externalId?: string;
  date: string;
  reference?: string;
  description: string;
  lineItems: BookkeepingJournalLine[];
  status: 'draft' | 'posted';
}

export interface BookkeepingJournalLine {
  accountCode: string;
  description: string;
  debitAmount?: number;
  creditAmount?: number;
  taxRate?: number;
  trackingCategory?: string;
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsSkipped: number;
  errors: SyncError[];
  duration: number; // milliseconds
  lastSyncDate: string;
}

export interface SyncError {
  type: 'validation' | 'authentication' | 'rate_limit' | 'network' | 'server' | 'business_logic';
  message: string;
  recordId?: string;
  details?: any;
}

export class BookkeepingIntegrationService {
  private providers: Map<string, BookkeepingProvider> = new Map();
  private connections: Map<string, BookkeepingConnection> = new Map();
  private adapters: Map<string, BookkeepingAdapter> = new Map();

  constructor() {
    this.initializeProviders();
    this.initializeAdapters();
    this.loadConnections();
  }

  private async initializeAdapters() {
    // Use dynamic imports to avoid circular dependency
    try {
      const { quickBooksAdapter } = await import('./integrations/QuickBooksAdapter');
      const { xeroAdapter } = await import('./integrations/XeroAdapter');
      const { sageAdapter, freshBooksAdapter, waveAdapter, zohoBooksAdapter } = await import('./integrations/BookkeepingAdapters');

      // Register all available adapters
      this.adapters.set('quickbooks', quickBooksAdapter);
      this.adapters.set('xero', xeroAdapter);
      this.adapters.set('sage', sageAdapter);
      this.adapters.set('freshbooks', freshBooksAdapter);
      this.adapters.set('wave', waveAdapter);
      this.adapters.set('zoho', zohoBooksAdapter);
    } catch (error) {
      console.error('Failed to initialize bookkeeping adapters:', error);
    }
  }

  private initializeProviders() {
    // Major bookkeeping providers configuration
    const providers: BookkeepingProvider[] = [
      {
        id: 'xero',
        name: 'Xero',
        type: 'xero',
        authType: 'oauth2',
        baseUrl: 'https://api.xero.com/api.xro/2.0',
        scopes: ['accounting.transactions', 'accounting.contacts.read', 'accounting.settings'],
        features: ['invoices', 'payments', 'customers', 'bank_transactions', 'journal_entries', 'financial_reports', 'tax_tracking'],
        limits: { rateLimit: 60, maxRetries: 3, timeout: 30000 }
      },
      {
        id: 'quickbooks',
        name: 'QuickBooks Online',
        type: 'quickbooks',
        authType: 'oauth2',
        baseUrl: 'https://sandbox-quickbooks.api.intuit.com/v3/company',
        scopes: ['com.intuit.quickbooks.accounting'],
        features: ['invoices', 'payments', 'customers', 'vendors', 'bank_transactions', 'journal_entries', 'financial_reports', 'payroll'],
        limits: { rateLimit: 500, maxRetries: 3, timeout: 30000 }
      },
      {
        id: 'sage',
        name: 'Sage Business Cloud Accounting',
        type: 'sage',
        authType: 'oauth2',
        baseUrl: 'https://api.accounting.sage.com/v3.1',
        scopes: ['full_access'],
        features: ['invoices', 'payments', 'customers', 'vendors', 'bank_transactions', 'financial_reports'],
        limits: { rateLimit: 200, maxRetries: 3, timeout: 30000 }
      },
      {
        id: 'freshbooks',
        name: 'FreshBooks',
        type: 'freshbooks',
        authType: 'oauth2',
        baseUrl: 'https://api.freshbooks.com',
        scopes: ['user:profile:read', 'user:clients:read', 'user:invoices:read', 'user:payments:read'],
        features: ['invoices', 'payments', 'customers', 'expense_tracking', 'financial_reports'],
        limits: { rateLimit: 100, maxRetries: 3, timeout: 30000 }
      },
      {
        id: 'wave',
        name: 'Wave Accounting',
        type: 'wave',
        authType: 'oauth2',
        baseUrl: 'https://gql.waveapps.com/graphql/public',
        scopes: ['business:read', 'customer:read', 'invoice:read', 'payment:read'],
        features: ['invoices', 'payments', 'customers', 'expense_tracking'],
        limits: { rateLimit: 300, maxRetries: 3, timeout: 30000 }
      },
      {
        id: 'zoho',
        name: 'Zoho Books',
        type: 'zoho',
        authType: 'oauth2',
        baseUrl: 'https://books.zoho.com/api/v3',
        scopes: ['ZohoBooks.fullaccess.all'],
        features: ['invoices', 'payments', 'customers', 'vendors', 'bank_transactions', 'expense_tracking', 'inventory'],
        limits: { rateLimit: 200, maxRetries: 3, timeout: 30000 }
      },
      {
        id: 'buildium',
        name: 'Buildium',
        type: 'buildium',
        authType: 'api_key',
        baseUrl: 'https://api.buildium.com',
        features: ['invoices', 'payments', 'customers', 'financial_reports', 'bill_management'],
        limits: { rateLimit: 1000, maxRetries: 3, timeout: 30000 }
      },
      {
        id: 'appfolio',
        name: 'AppFolio Property Manager',
        type: 'appfolio',
        authType: 'oauth2',
        baseUrl: 'https://api.appfolio.com/v1',
        features: ['invoices', 'payments', 'customers', 'financial_reports'],
        limits: { rateLimit: 100, maxRetries: 3, timeout: 30000 }
      }
    ];

    providers.forEach(provider => {
      this.providers.set(provider.id, provider);
    });
  }

  private loadConnections() {
    // Load saved connections from storage
    const savedConnections = localStorage.getItem('bookkeeping_connections');
    if (savedConnections) {
      const connections: BookkeepingConnection[] = JSON.parse(savedConnections);
      connections.forEach(conn => {
        this.connections.set(conn.id, conn);
      });
    }
  }

  private saveConnections() {
    const connections = Array.from(this.connections.values());
    localStorage.setItem('bookkeeping_connections', JSON.stringify(connections));
  }

  /**
   * Get all available bookkeeping providers
   */
  getAvailableProviders(): BookkeepingProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get provider by ID
   */
  getProvider(providerId: string): BookkeepingProvider | undefined {
    return this.providers.get(providerId);
  }

  /**
   * Get all active connections
   */
  getConnections(): BookkeepingConnection[] {
    return Array.from(this.connections.values());
  }

  /**
   * Get connection by provider ID
   */
  getConnection(providerId: string): BookkeepingConnection | undefined {
    return Array.from(this.connections.values()).find(conn => conn.providerId === providerId);
  }

  /**
   * Create a new bookkeeping connection
   */
  async createConnection(
    providerId: string, 
    credentials: BookkeepingCredentials, 
    configuration: BookkeepingConfiguration
  ): Promise<BookkeepingConnection> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    const connectionId = `conn_${providerId}_${Date.now()}`;
    const connection: BookkeepingConnection = {
      id: connectionId,
      providerId,
      tenantId: 'current_tenant', // Replace with actual tenant ID
      isActive: true,
      credentials,
      configuration,
      lastSync: new Date().toISOString(),
      syncStatus: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Test connection before saving
    await this.testConnection(connection);

    this.connections.set(connectionId, connection);
    this.saveConnections();

    return connection;
  }

  /**
   * Update an existing connection
   */
  async updateConnection(
    connectionId: string, 
    updates: Partial<BookkeepingConnection>
  ): Promise<BookkeepingConnection> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    const updatedConnection = {
      ...connection,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.connections.set(connectionId, updatedConnection);
    this.saveConnections();

    return updatedConnection;
  }

  /**
   * Delete a connection
   */
  async deleteConnection(connectionId: string): Promise<void> {
    this.connections.delete(connectionId);
    this.saveConnections();
  }

  /**
   * Test connection to bookkeeping provider
   */
  async testConnection(connection: BookkeepingConnection): Promise<{ success: boolean; message: string }> {
    const adapter = this.getAdapter(connection.providerId);
    if (!adapter) {
      throw new Error(`Adapter for ${connection.providerId} not available`);
    }

    try {
      const result = await adapter.testConnection(connection);
      return result;
    } catch (error) {
      return {
        success: false,
        message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Sync rent payment to bookkeeping system
   */
  async syncRentPayment(connectionId: string, payment: RentPayment): Promise<SyncResult> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    const adapter = this.getAdapter(connection.providerId);
    if (!adapter) {
      throw new Error(`Adapter for ${connection.providerId} not available`);
    }

    const startTime = Date.now();
    
    try {
      // Convert CRM payment to bookkeeping format
      const bookkeepingInvoice = this.convertRentPaymentToInvoice(payment, connection);
      const bookkeepingPayment = this.convertRentPaymentToPayment(payment, connection);

      let recordsCreated = 0;
      let recordsUpdated = 0;
      const errors: SyncError[] = [];

      // Create or update invoice
      try {
        if (payment.status === 'completed') {
          await adapter.createInvoice(connection, bookkeepingInvoice);
          await adapter.createPayment(connection, bookkeepingPayment);
          recordsCreated += 2;
        } else {
          await adapter.createInvoice(connection, bookkeepingInvoice);
          recordsCreated += 1;
        }
      } catch (error) {
        errors.push({
          type: 'business_logic',
          message: error instanceof Error ? error.message : 'Failed to sync payment',
          recordId: payment.id
        });
      }

      // Update connection last sync
      await this.updateConnection(connectionId, { 
        lastSync: new Date().toISOString(),
        syncStatus: errors.length > 0 ? 'error' : 'active',
        lastError: errors.length > 0 ? errors[0].message : undefined
      });

      return {
        success: errors.length === 0,
        recordsProcessed: 1,
        recordsCreated,
        recordsUpdated,
        recordsSkipped: errors.length > 0 ? 1 : 0,
        errors,
        duration: Date.now() - startTime,
        lastSyncDate: new Date().toISOString()
      };

    } catch (error) {
      return {
        success: false,
        recordsProcessed: 1,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsSkipped: 1,
        errors: [{
          type: 'server',
          message: error instanceof Error ? error.message : 'Unknown sync error',
          recordId: payment.id
        }],
        duration: Date.now() - startTime,
        lastSyncDate: new Date().toISOString()
      };
    }
  }

  /**
   * Sync multiple rent payments in batch
   */
  async syncRentPaymentsBatch(connectionId: string, payments: RentPayment[]): Promise<SyncResult> {
    const startTime = Date.now();
    let totalRecordsCreated = 0;
    let totalRecordsUpdated = 0;
    let totalRecordsSkipped = 0;
    const allErrors: SyncError[] = [];

    for (const payment of payments) {
      try {
        const result = await this.syncRentPayment(connectionId, payment);
        totalRecordsCreated += result.recordsCreated;
        totalRecordsUpdated += result.recordsUpdated;
        totalRecordsSkipped += result.recordsSkipped;
        allErrors.push(...result.errors);
      } catch (error) {
        totalRecordsSkipped++;
        allErrors.push({
          type: 'server',
          message: error instanceof Error ? error.message : 'Batch sync error',
          recordId: payment.id
        });
      }
    }

    return {
      success: allErrors.length === 0,
      recordsProcessed: payments.length,
      recordsCreated: totalRecordsCreated,
      recordsUpdated: totalRecordsUpdated,
      recordsSkipped: totalRecordsSkipped,
      errors: allErrors,
      duration: Date.now() - startTime,
      lastSyncDate: new Date().toISOString()
    };
  }

  /**
   * Sync ledger entries as journal entries
   */
  async syncLedgerEntries(connectionId: string, entries: LedgerEntry[]): Promise<SyncResult> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    const adapter = this.getAdapter(connection.providerId);
    if (!adapter) {
      throw new Error(`Adapter for ${connection.providerId} not available`);
    }

    const startTime = Date.now();
    let recordsCreated = 0;
    const errors: SyncError[] = [];

    for (const entry of entries) {
      try {
        const journalEntry = this.convertLedgerEntryToJournal(entry, connection);
        await adapter.createJournalEntry(connection, journalEntry);
        recordsCreated++;
      } catch (error) {
        errors.push({
          type: 'business_logic',
          message: error instanceof Error ? error.message : 'Failed to sync ledger entry',
          recordId: entry.id
        });
      }
    }

    return {
      success: errors.length === 0,
      recordsProcessed: entries.length,
      recordsCreated,
      recordsUpdated: 0,
      recordsSkipped: errors.length,
      errors,
      duration: Date.now() - startTime,
      lastSyncDate: new Date().toISOString()
    };
  }

  /**
   * Get financial reports from bookkeeping system
   */
  async getFinancialReports(
    connectionId: string, 
    reportType: string, 
    startDate: string, 
    endDate: string
  ): Promise<any> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    const adapter = this.getAdapter(connection.providerId);
    if (!adapter) {
      throw new Error(`Adapter for ${connection.providerId} not available`);
    }

    return await adapter.getFinancialReport(connection, reportType, startDate, endDate);
  }

  // Private helper methods
  private getAdapter(providerId: string): BookkeepingAdapter | undefined {
    return this.adapters.get(providerId);
  }

  private convertRentPaymentToInvoice(payment: RentPayment, connection: BookkeepingConnection): BookkeepingInvoice {
    const lineItems: BookkeepingLineItem[] = [
      {
        description: 'Rent Payment',
        quantity: 1,
        unitPrice: payment.amount,
        totalAmount: payment.amount,
        accountCode: connection.configuration.accountMappings.rentIncomeAccount
      }
    ];

    // Add fees as separate line items
    payment.fees.forEach(fee => {
      lineItems.push({
        description: fee.description,
        quantity: 1,
        unitPrice: fee.amount,
        totalAmount: fee.amount,
        accountCode: connection.configuration.accountMappings.lateFeeAccount
      });
    });

    return {
      customerId: payment.tenantId,
      customerName: `Tenant ${payment.tenantId}`,
      invoiceNumber: `RENT-${payment.id}`,
      issueDate: payment.dueDate,
      dueDate: payment.dueDate,
      amount: payment.amount + payment.fees.reduce((sum, fee) => sum + fee.amount, 0),
      status: payment.status === 'completed' ? 'paid' : 'sent',
      lineItems,
      description: `Rent payment for ${new Date(payment.dueDate).toLocaleDateString()}`,
      reference: payment.id
    };
  }

  private convertRentPaymentToPayment(payment: RentPayment, connection: BookkeepingConnection): BookkeepingPayment {
    return {
      customerId: payment.tenantId,
      amount: payment.amount,
      paymentDate: payment.paidDate || payment.dueDate,
      paymentMethod: payment.paymentMethodId || 'Cash',
      reference: payment.transactionId || payment.confirmationCode,
      bankAccount: connection.configuration.accountMappings.bankAccount,
      description: `Rent payment - ${payment.id}`
    };
  }

  private convertLedgerEntryToJournal(entry: LedgerEntry, connection: BookkeepingConnection): BookkeepingJournalEntry {
    const lineItems: BookkeepingJournalLine[] = [];

    if (entry.amount > 0) {
      // Debit entry
      lineItems.push({
        accountCode: this.getAccountCodeForLedgerType(entry.type, connection),
        description: entry.description,
        debitAmount: Math.abs(entry.amount)
      });
      
      // Credit to accounts receivable
      lineItems.push({
        accountCode: connection.configuration.accountMappings.receivablesAccount || '1200',
        description: entry.description,
        creditAmount: Math.abs(entry.amount)
      });
    } else {
      // Credit entry
      lineItems.push({
        accountCode: connection.configuration.accountMappings.receivablesAccount || '1200',
        description: entry.description,
        debitAmount: Math.abs(entry.amount)
      });
      
      lineItems.push({
        accountCode: this.getAccountCodeForLedgerType(entry.type, connection),
        description: entry.description,
        creditAmount: Math.abs(entry.amount)
      });
    }

    return {
      date: entry.date,
      reference: entry.id,
      description: entry.description,
      lineItems,
      status: 'posted'
    };
  }

  private getAccountCodeForLedgerType(type: LedgerEntry['type'], connection: BookkeepingConnection): string {
    const mappings = connection.configuration.accountMappings;
    
    switch (type) {
      case 'rent': return mappings.rentIncomeAccount || '4000';
      case 'deposit': return mappings.securityDepositAccount || '2000';
      case 'late_fee': return mappings.lateFeeAccount || '4100';
      case 'fee': return mappings.lateFeeAccount || '4100';
      default: return '4000'; // Default to rent income
    }
  }
}

/**
 * Abstract base class for bookkeeping adapters
 */
export abstract class BookkeepingAdapter {
  abstract testConnection(connection: BookkeepingConnection): Promise<{ success: boolean; message: string }>;
  abstract createCustomer(connection: BookkeepingConnection, customer: BookkeepingCustomer): Promise<BookkeepingCustomer>;
  abstract createInvoice(connection: BookkeepingConnection, invoice: BookkeepingInvoice): Promise<BookkeepingInvoice>;
  abstract createPayment(connection: BookkeepingConnection, payment: BookkeepingPayment): Promise<BookkeepingPayment>;
  abstract createJournalEntry(connection: BookkeepingConnection, entry: BookkeepingJournalEntry): Promise<BookkeepingJournalEntry>;
  abstract getFinancialReport(connection: BookkeepingConnection, reportType: string, startDate: string, endDate: string): Promise<any>;
}

// Export singleton instance
export const bookkeepingIntegrationService = new BookkeepingIntegrationService();
