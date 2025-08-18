export interface PaymentMethod {
  id: string;
  type: 'card' | 'ach' | 'bank_transfer' | 'cash' | 'money_order' | 'cashiers_check';
  name: string;
  details: CardDetails | BankDetails | CashLocationDetails;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CardDetails {
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
}

export interface BankDetails {
  bankName: string;
  accountType: 'checking' | 'savings';
  last4: string;
  routingNumber: string;
}

export interface CashLocationDetails {
  provider: 'western_union' | 'walmart' | 'moneygram' | 'cvs' | 'walgreens' | 'other';
  locationName: string;
  address: string;
  paymentCode: string;
}

export interface RentPayment {
  id: string;
  tenantId: string;
  propertyId: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'overdue' | 'partial';
  paymentMethodId?: string;
  transactionId?: string;
  fees: PaymentFee[];
  lateFee?: number;
  notes?: string;
  receiptUrl?: string;
  confirmationCode?: string;
  processedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentFee {
  id: string;
  type: 'convenience' | 'processing' | 'late' | 'nsf' | 'other';
  amount: number;
  description: string;
}

export interface PaymentSchedule {
  id: string;
  tenantId: string;
  propertyId: string;
  rentAmount: number;
  dueDay: number; // Day of month (1-31)
  isActive: boolean;
  autoPayEnabled: boolean;
  preferredPaymentMethodId?: string;
  nextDueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentReminder {
  id: string;
  tenantId: string;
  paymentId: string;
  type: 'upcoming' | 'overdue' | 'failed';
  daysBeforeDue: number;
  method: 'email' | 'sms' | 'push' | 'mail';
  sent: boolean;
  sentAt?: string;
  createdAt: string;
}

export interface PaymentProcessor {
  id: string;
  name: string;
  type: 'stripe' | 'square' | 'paypal' | 'authorize_net' | 'dwolla' | 'plaid';
  isActive: boolean;
  supportedMethods: PaymentMethod['type'][];
  fees: {
    card: number; // percentage
    ach: number; // flat fee in cents
    bank_transfer: number;
  };
  credentials: Record<string, string>;
}

export interface CashPaymentLocation {
  id: string;
  provider: CashLocationDetails['provider'];
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  hours?: string;
  fees: number; // flat fee in cents
  isActive: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface PaymentReport {
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  totalCollected: number;
  totalDue: number;
  collectionRate: number;
  paymentMethodBreakdown: Record<PaymentMethod['type'], number>;
  latePayments: number;
  averageDaysLate: number;
  topPerformingProperties: string[];
  underperformingTenants: string[];
}

export interface AutoPaySetup {
  id: string;
  tenantId: string;
  paymentMethodId: string;
  isActive: boolean;
  retryAttempts: number;
  retryDays: number[];
  failureNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentDispute {
  id: string;
  paymentId: string;
  tenantId: string;
  reason: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  amount: number;
  description: string;
  evidence: DisputeEvidence[];
  createdAt: string;
  resolvedAt?: string;
}

export interface DisputeEvidence {
  id: string;
  type: 'document' | 'email' | 'photo' | 'receipt';
  url: string;
  description: string;
  uploadedAt: string;
}
