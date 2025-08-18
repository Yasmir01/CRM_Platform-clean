import { RentPayment, PaymentMethod, AutoPaySetup } from './PaymentTypes';

export interface TenantFinancialProfile {
  tenantId: string;
  currentBalance: number;
  securityDeposit: number;
  monthlyRent: number;
  lastPaymentDate?: string;
  nextPaymentDue: string;
  paymentStatus: 'current' | 'late' | 'partial' | 'overdue';
  daysLate: number;
  totalPaid: number;
  totalOwed: number;
  paymentHistory: RentPayment[];
  ledgerEntries: LedgerEntry[];
  autoPayStatus: AutoPayStatus;
  notificationPreferences: NotificationPreferences;
  paymentMethods: PaymentMethod[];
  creditScore?: number;
  riskAssessment: RiskAssessment;
}

export interface LedgerEntry {
  id: string;
  tenantId: string;
  propertyId: string;
  date: string;
  type: 'rent' | 'deposit' | 'fee' | 'refund' | 'late_fee' | 'credit' | 'debit' | 'adjustment';
  description: string;
  amount: number;
  balance: number;
  paymentId?: string;
  category: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface AutoPayStatus {
  isEnabled: boolean;
  paymentMethodId?: string;
  nextProcessingDate?: string;
  lastProcessedDate?: string;
  failedAttempts: number;
  status: 'active' | 'paused' | 'failed' | 'disabled';
  lastFailureReason?: string;
}

export interface NotificationPreferences {
  email: {
    enabled: boolean;
    address: string;
    types: NotificationType[];
  };
  sms: {
    enabled: boolean;
    phoneNumber: string;
    types: NotificationType[];
  };
  push: {
    enabled: boolean;
    types: NotificationType[];
  };
  mail: {
    enabled: boolean;
    address: string;
    types: NotificationType[];
  };
}

export type NotificationType = 
  | 'payment_reminder' 
  | 'payment_confirmation' 
  | 'late_payment' 
  | 'autopay_failure' 
  | 'lease_renewal' 
  | 'maintenance_updates';

export interface RiskAssessment {
  score: number; // 0-100, higher is riskier
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  lastUpdated: string;
  recommendations: string[];
}

export interface RiskFactor {
  type: 'payment_history' | 'income_ratio' | 'credit_score' | 'employment' | 'previous_evictions';
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

export interface FinancialSummary {
  totalCollected: number;
  totalOutstanding: number;
  collectionRate: number;
  averageDaysLate: number;
  onTimePayments: number;
  latePayments: number;
  missedPayments: number;
  lastPaymentAmount: number;
  lastPaymentDate: string;
  projectedMonthlyIncome: number;
}

export interface PaymentAlert {
  id: string;
  tenantId: string;
  type: 'overdue' | 'autopay_failed' | 'insufficient_funds' | 'payment_method_expired' | 'high_risk';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  actionRequired: boolean;
  dueDate?: string;
  amount?: number;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface TenantPaymentActions {
  canProcessPayment: boolean;
  canSetupAutoPay: boolean;
  canSendReminder: boolean;
  canApplyLateFee: boolean;
  canOfferPaymentPlan: boolean;
  canInitiateEviction: boolean;
  restrictedActions: string[];
}

export interface PaymentPlan {
  id: string;
  tenantId: string;
  totalAmount: number;
  installments: PaymentInstallment[];
  status: 'active' | 'completed' | 'defaulted' | 'cancelled';
  createdDate: string;
  agreementDate: string;
  notes: string;
}

export interface PaymentInstallment {
  id: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'skipped';
  paymentId?: string;
}

export interface TenantCommunicationLog {
  id: string;
  tenantId: string;
  type: 'email' | 'sms' | 'call' | 'letter' | 'in_person';
  subject: string;
  content: string;
  sentDate: string;
  sentBy: string;
  delivered: boolean;
  opened?: boolean;
  responded?: boolean;
  responseContent?: string;
  responseDate?: string;
  category: 'payment_reminder' | 'late_notice' | 'general' | 'maintenance' | 'lease';
}

export interface PropertyFinancialSummary {
  propertyId: string;
  totalUnits: number;
  occupiedUnits: number;
  totalMonthlyRent: number;
  collectedThisMonth: number;
  outstandingAmount: number;
  collectionRate: number;
  averageDaysLate: number;
  tenantFinancials: TenantFinancialProfile[];
  topPerformingTenants: string[];
  atRiskTenants: string[];
  alerts: PaymentAlert[];
}
