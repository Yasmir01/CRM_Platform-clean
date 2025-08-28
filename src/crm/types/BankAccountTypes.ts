import { PaymentMethod } from './PaymentTypes';

// Bank Account Connection Types
export interface BankConnection {
  id: string;
  tenantId: string;
  bankName: string;
  accountType: 'checking' | 'savings' | 'business_checking' | 'business_savings';
  accountNumber: string; // Encrypted/tokenized
  routingNumber: string;
  accountHolderName: string;
  isVerified: boolean;
  verificationStatus: 'pending' | 'verified' | 'failed' | 'micro_deposits_sent' | 'manual_review';
  verificationMethod: 'plaid' | 'micro_deposits' | 'instant' | 'manual';
  plaidAccountId?: string;
  plaidAccessToken?: string; // Encrypted
  isActive: boolean;
  isDefault: boolean;
  permissions: BankAccountPermission[];
  riskScore: number;
  dailyLimit?: number;
  monthlyLimit?: number;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccountPermission {
  type: 'read' | 'debit' | 'credit';
  granted: boolean;
  expiresAt?: string;
}

export interface BankVerification {
  id: string;
  bankConnectionId: string;
  method: 'micro_deposits' | 'instant' | 'manual';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'expired';
  attempts: number;
  maxAttempts: number;
  microDeposits?: MicroDeposit[];
  verificationCode?: string;
  expiresAt: string;
  completedAt?: string;
  failureReason?: string;
  createdAt: string;
}

export interface MicroDeposit {
  amount: number; // in cents
  description: string;
  status: 'sent' | 'verified' | 'failed';
  sentAt: string;
  verifiedAt?: string;
}

export interface BankTransaction {
  id: string;
  bankConnectionId: string;
  type: 'debit' | 'credit';
  amount: number;
  description: string;
  reference: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'reversed';
  achTransactionId?: string;
  failureReason?: string;
  effectiveDate: string;
  processedAt?: string;
  createdAt: string;
}

export interface BusinessBankAccount {
  id: string;
  organizationId: string;
  bankName: string;
  accountType: 'business_checking' | 'business_savings' | 'money_market';
  accountNumber: string; // Encrypted
  routingNumber: string;
  accountHolderName: string;
  businessName: string;
  taxId: string; // Encrypted
  isVerified: boolean;
  isPrimary: boolean;
  canReceivePayments: boolean;
  canSendPayments: boolean;
  dailyReceiveLimit: number;
  monthlyReceiveLimit: number;
  fees: BusinessAccountFees;
  processingSchedule: ProcessingSchedule;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessAccountFees {
  achReceive: number; // in cents
  achSend: number;
  wireReceive: number;
  wireSend: number;
  monthlyMaintenance: number;
  overdraftFee: number;
}

export interface ProcessingSchedule {
  achDebitDays: number[]; // 0-6 (Sunday-Saturday)
  achCreditDays: number[];
  cutoffTime: string; // HH:MM format
  timezone: string;
  holidays: string[]; // ISO dates when processing is paused
}

export interface PlaidLinkConfig {
  clientName: string;
  env: 'sandbox' | 'development' | 'production';
  products: PlaidProduct[];
  countryCodes: string[];
  language: string;
  webhookUrl?: string;
  accountFilters?: {
    depository?: {
      account_subtypes: ('checking' | 'savings')[];
    };
  };
}

export type PlaidProduct = 'transactions' | 'auth' | 'identity' | 'income' | 'assets' | 'investments';

export interface PlaidLinkResult {
  publicToken: string;
  metadata: {
    institution: {
      name: string;
      institution_id: string;
    };
    accounts: Array<{
      id: string;
      name: string;
      type: string;
      subtype: string;
      mask: string;
    }>;
    link_session_id: string;
  };
}

export interface ACHProcessingResult {
  transactionId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  amount: number;
  effectiveDate: string;
  processingFee: number;
  estimatedSettlement: string;
  error?: string;
}

export interface BankAccountValidation {
  routingNumber: {
    isValid: boolean;
    bankName?: string;
    federalReserveRoutingSymbol?: string;
    achParticipant: boolean;
    wireParticipant: boolean;
  };
  accountNumber: {
    isValid: boolean;
    format: 'valid' | 'invalid' | 'unknown';
    checkDigit?: boolean;
  };
  riskFlags: BankRiskFlag[];
}

export interface BankRiskFlag {
  type: 'high_risk_bank' | 'suspicious_activity' | 'velocity_check' | 'blacklist';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  action: 'allow' | 'review' | 'block';
}

export interface PaymentRoute {
  id: string;
  name: string;
  businessBankAccountId: string;
  routingRules: RoutingRule[];
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface RoutingRule {
  condition: 'property_type' | 'payment_amount' | 'tenant_risk' | 'payment_method' | 'time_of_day';
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in_range';
  value: string | number | string[];
  bankAccountId: string;
}

// Extended PaymentMethod for bank accounts
export interface EnhancedPaymentMethod extends PaymentMethod {
  bankConnectionId?: string;
  processingFee?: number;
  processingTime?: string; // e.g., "1-3 business days"
  limits?: {
    daily: number;
    monthly: number;
    perTransaction: number;
  };
}
