import { 
  TenantFinancialProfile, 
  LedgerEntry, 
  AutoPayStatus, 
  NotificationPreferences,
  RiskAssessment,
  FinancialSummary,
  PaymentAlert,
  TenantPaymentActions,
  PaymentPlan,
  TenantCommunicationLog,
  PropertyFinancialSummary
} from '../types/TenantFinancialTypes';
import { RentPayment, PaymentMethod } from '../types/PaymentTypes';
import { paymentService } from './PaymentService';
import dayjs from 'dayjs';

export class TenantFinancialService {
  private static instance: TenantFinancialService;
  private tenantProfiles: Map<string, TenantFinancialProfile> = new Map();
  private ledgerEntries: LedgerEntry[] = [];
  private paymentAlerts: PaymentAlert[] = [];
  private paymentPlans: PaymentPlan[] = [];
  private communicationLogs: TenantCommunicationLog[] = [];
  private subscribers: Map<string, (profile: TenantFinancialProfile) => void> = new Map();

  private constructor() {
    this.initializeMockData();
    this.startRealTimeUpdates();
  }

  public static getInstance(): TenantFinancialService {
    if (!TenantFinancialService.instance) {
      TenantFinancialService.instance = new TenantFinancialService();
    }
    return TenantFinancialService.instance;
  }

  // Real-time subscription system
  subscribe(tenantId: string, callback: (profile: TenantFinancialProfile) => void): void {
    this.subscribers.set(tenantId, callback);
  }

  unsubscribe(tenantId: string): void {
    this.subscribers.delete(tenantId);
  }

  private notifySubscribers(tenantId: string): void {
    const callback = this.subscribers.get(tenantId);
    const profile = this.tenantProfiles.get(tenantId);
    if (callback && profile) {
      callback(profile);
    }
  }

  // Get tenant financial profile
  async getTenantFinancialProfile(tenantId: string): Promise<TenantFinancialProfile | null> {
    let profile = this.tenantProfiles.get(tenantId);
    
    if (!profile) {
      profile = await this.createTenantFinancialProfile(tenantId);
    }
    
    // Update with real-time data
    await this.updateFinancialProfile(tenantId);
    
    return this.tenantProfiles.get(tenantId) || null;
  }

  // Create new financial profile
  private async createTenantFinancialProfile(tenantId: string): Promise<TenantFinancialProfile> {
    const payments = await paymentService.getRentPayments(tenantId);
    const paymentMethods = await paymentService.getPaymentMethods(tenantId);
    const autoPaySetup = await paymentService.getAutoPaySetup(tenantId);
    
    const profile: TenantFinancialProfile = {
      tenantId,
      currentBalance: 0,
      securityDeposit: 2500, // Default, should come from lease data
      monthlyRent: 2000, // Default, should come from lease data
      lastPaymentDate: undefined,
      nextPaymentDue: dayjs().add(1, 'month').format('YYYY-MM-DD'),
      paymentStatus: 'current',
      daysLate: 0,
      totalPaid: 0,
      totalOwed: 0,
      paymentHistory: payments,
      ledgerEntries: this.getLedgerEntries(tenantId),
      autoPayStatus: this.convertAutoPaySetup(autoPaySetup),
      notificationPreferences: this.getDefaultNotificationPreferences(),
      paymentMethods,
      riskAssessment: await this.calculateRiskAssessment(tenantId, payments),
    };

    this.tenantProfiles.set(tenantId, profile);
    return profile;
  }

  // Update financial profile with latest data
  private async updateFinancialProfile(tenantId: string): Promise<void> {
    const profile = this.tenantProfiles.get(tenantId);
    if (!profile) return;

    const payments = await paymentService.getRentPayments(tenantId);
    const summary = this.calculateFinancialSummary(payments);
    
    // Update payment status
    const latestPayment = payments[0];
    if (latestPayment) {
      profile.lastPaymentDate = latestPayment.paidDate;
      profile.daysLate = this.calculateDaysLate(latestPayment);
      profile.paymentStatus = this.determinePaymentStatus(payments);
    }

    // Update totals
    profile.totalPaid = summary.totalCollected;
    profile.totalOwed = summary.totalOutstanding;
    profile.currentBalance = profile.totalOwed - profile.totalPaid;
    profile.paymentHistory = payments;

    // Update ledger
    profile.ledgerEntries = this.getLedgerEntries(tenantId);

    // Update risk assessment
    profile.riskAssessment = await this.calculateRiskAssessment(tenantId, payments);

    this.tenantProfiles.set(tenantId, profile);
    this.notifySubscribers(tenantId);
  }

  // Calculate financial summary
  private calculateFinancialSummary(payments: RentPayment[]): FinancialSummary {
    const paidPayments = payments.filter(p => p.status === 'completed');
    const totalCollected = paidPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalOutstanding = payments
      .filter(p => p.status !== 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    const onTimePayments = paidPayments.filter(p => {
      if (!p.paidDate) return false;
      return dayjs(p.paidDate).isSameOrBefore(dayjs(p.dueDate));
    }).length;

    const latePayments = paidPayments.filter(p => {
      if (!p.paidDate) return false;
      return dayjs(p.paidDate).isAfter(dayjs(p.dueDate));
    }).length;

    const missedPayments = payments.filter(p => 
      p.status === 'overdue' || 
      (p.status === 'pending' && dayjs(p.dueDate).isBefore(dayjs()))
    ).length;

    const collectionRate = payments.length > 0 ? (paidPayments.length / payments.length) * 100 : 0;

    const lateDays = paidPayments
      .filter(p => p.paidDate && dayjs(p.paidDate).isAfter(dayjs(p.dueDate)))
      .map(p => dayjs(p.paidDate).diff(dayjs(p.dueDate), 'day'));
    
    const averageDaysLate = lateDays.length > 0 
      ? lateDays.reduce((sum, days) => sum + days, 0) / lateDays.length 
      : 0;

    const lastPayment = paidPayments[0];

    return {
      totalCollected,
      totalOutstanding,
      collectionRate,
      averageDaysLate,
      onTimePayments,
      latePayments,
      missedPayments,
      lastPaymentAmount: lastPayment?.amount || 0,
      lastPaymentDate: lastPayment?.paidDate || '',
      projectedMonthlyIncome: 2000 // Should come from lease data
    };
  }

  // Calculate risk assessment
  private async calculateRiskAssessment(tenantId: string, payments: RentPayment[]): Promise<RiskAssessment> {
    const summary = this.calculateFinancialSummary(payments);
    let score = 0;
    const factors = [];

    // Payment history factor (40% weight)
    if (summary.collectionRate < 80) {
      score += 40;
      factors.push({
        type: 'payment_history' as const,
        impact: 'negative' as const,
        weight: 40,
        description: 'Poor payment history'
      });
    } else if (summary.collectionRate > 95) {
      factors.push({
        type: 'payment_history' as const,
        impact: 'positive' as const,
        weight: 40,
        description: 'Excellent payment history'
      });
    }

    // Late payment frequency (30% weight)
    if (summary.averageDaysLate > 10) {
      score += 30;
      factors.push({
        type: 'payment_history' as const,
        impact: 'negative' as const,
        weight: 30,
        description: 'Frequently late payments'
      });
    }

    // Recent payment status (30% weight)
    if (summary.missedPayments > 0) {
      score += 30;
      factors.push({
        type: 'payment_history' as const,
        impact: 'negative' as const,
        weight: 30,
        description: 'Recent missed payments'
      });
    }

    let level: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (score > 70) level = 'critical';
    else if (score > 50) level = 'high';
    else if (score > 25) level = 'medium';

    const recommendations = this.generateRiskRecommendations(score, factors);

    return {
      score,
      level,
      factors,
      lastUpdated: dayjs().toISOString(),
      recommendations
    };
  }

  // Generate risk-based recommendations
  private generateRiskRecommendations(score: number, factors: any[]): string[] {
    const recommendations = [];

    if (score > 50) {
      recommendations.push('Consider requiring additional security deposit');
      recommendations.push('Implement automatic payment reminders');
      recommendations.push('Schedule tenant meeting to discuss payment issues');
    }

    if (score > 70) {
      recommendations.push('Review lease terms and consider early intervention');
      recommendations.push('Document all communication for potential legal action');
      recommendations.push('Consider payment plan arrangement');
    }

    if (factors.some(f => f.type === 'payment_history' && f.impact === 'negative')) {
      recommendations.push('Set up autopay to improve payment consistency');
      recommendations.push('Provide financial counseling resources');
    }

    return recommendations;
  }

  // Autopay status management
  async updateAutoPayStatus(tenantId: string, status: Partial<AutoPayStatus>): Promise<void> {
    const profile = this.tenantProfiles.get(tenantId);
    if (!profile) return;

    profile.autoPayStatus = { ...profile.autoPayStatus, ...status };
    this.tenantProfiles.set(tenantId, profile);
    this.notifySubscribers(tenantId);

    // Log the change
    await this.addLedgerEntry(tenantId, {
      type: 'adjustment',
      description: `AutoPay status updated: ${status.isEnabled ? 'enabled' : 'disabled'}`,
      amount: 0,
      category: 'system'
    });
  }

  // Notification preferences management
  async updateNotificationPreferences(tenantId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    const profile = this.tenantProfiles.get(tenantId);
    if (!profile) return;

    profile.notificationPreferences = { ...profile.notificationPreferences, ...preferences };
    this.tenantProfiles.set(tenantId, profile);
    this.notifySubscribers(tenantId);
  }

  // Ledger management
  async addLedgerEntry(tenantId: string, entry: Omit<LedgerEntry, 'id' | 'tenantId' | 'createdAt' | 'createdBy' | 'balance'>): Promise<LedgerEntry> {
    const profile = this.tenantProfiles.get(tenantId);
    if (!profile) throw new Error('Tenant profile not found');

    const previousBalance = profile.currentBalance;
    const newBalance = entry.type === 'credit' || entry.type === 'refund' 
      ? previousBalance - entry.amount 
      : previousBalance + entry.amount;

    const ledgerEntry: LedgerEntry = {
      id: `ledger_${Date.now()}`,
      tenantId,
      propertyId: 'prop_1', // Should come from tenant data
      date: dayjs().format('YYYY-MM-DD'),
      createdAt: dayjs().toISOString(),
      createdBy: 'system', // Should come from auth context
      balance: newBalance,
      ...entry
    };

    this.ledgerEntries.push(ledgerEntry);
    profile.ledgerEntries = this.getLedgerEntries(tenantId);
    profile.currentBalance = newBalance;

    this.tenantProfiles.set(tenantId, profile);
    this.notifySubscribers(tenantId);

    return ledgerEntry;
  }

  // Get ledger entries for tenant
  private getLedgerEntries(tenantId: string): LedgerEntry[] {
    return this.ledgerEntries
      .filter(entry => entry.tenantId === tenantId)
      .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());
  }

  // Payment alerts management
  async getPaymentAlerts(tenantId: string): Promise<PaymentAlert[]> {
    return this.paymentAlerts
      .filter(alert => alert.tenantId === tenantId && !alert.resolvedAt)
      .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
  }

  async createPaymentAlert(tenantId: string, alert: Omit<PaymentAlert, 'id' | 'tenantId' | 'createdAt'>): Promise<PaymentAlert> {
    const newAlert: PaymentAlert = {
      id: `alert_${Date.now()}`,
      tenantId,
      createdAt: dayjs().toISOString(),
      ...alert
    };

    this.paymentAlerts.push(newAlert);
    this.notifySubscribers(tenantId);

    return newAlert;
  }

  // Determine available payment actions
  async getTenantPaymentActions(tenantId: string): Promise<TenantPaymentActions> {
    const profile = await this.getTenantFinancialProfile(tenantId);
    if (!profile) {
      return {
        canProcessPayment: false,
        canSetupAutoPay: false,
        canSendReminder: false,
        canApplyLateFee: false,
        canOfferPaymentPlan: false,
        canInitiateEviction: false,
        restrictedActions: ['All actions restricted - profile not found']
      };
    }

    const actions: TenantPaymentActions = {
      canProcessPayment: profile.paymentMethods.length > 0,
      canSetupAutoPay: profile.paymentMethods.length > 0 && !profile.autoPayStatus.isEnabled,
      canSendReminder: profile.currentBalance > 0,
      canApplyLateFee: profile.daysLate > 5 && profile.currentBalance > 0,
      canOfferPaymentPlan: profile.currentBalance > profile.monthlyRent,
      canInitiateEviction: profile.daysLate > 30 && profile.riskAssessment.level === 'critical',
      restrictedActions: []
    };

    // Add restrictions based on tenant status
    if (profile.riskAssessment.level === 'low') {
      actions.canInitiateEviction = false;
      actions.restrictedActions.push('Eviction not allowed for low-risk tenants');
    }

    return actions;
  }

  // Property-level financial summary
  async getPropertyFinancialSummary(propertyId: string): Promise<PropertyFinancialSummary> {
    // This would typically get tenant IDs from property data
    const tenantIds = ['tenant_1', 'tenant_2', 'tenant_3']; // Mock data
    
    const tenantFinancials = await Promise.all(
      tenantIds.map(id => this.getTenantFinancialProfile(id))
    );

    const validProfiles = tenantFinancials.filter(p => p !== null) as TenantFinancialProfile[];
    
    const totalMonthlyRent = validProfiles.reduce((sum, p) => sum + p.monthlyRent, 0);
    const collectedThisMonth = validProfiles.reduce((sum, p) => sum + p.totalPaid, 0);
    const outstandingAmount = validProfiles.reduce((sum, p) => sum + p.currentBalance, 0);
    
    const collectionRate = totalMonthlyRent > 0 ? (collectedThisMonth / totalMonthlyRent) * 100 : 0;
    
    const daysLateArray = validProfiles.map(p => p.daysLate).filter(days => days > 0);
    const averageDaysLate = daysLateArray.length > 0 
      ? daysLateArray.reduce((sum, days) => sum + days, 0) / daysLateArray.length 
      : 0;

    const topPerformingTenants = validProfiles
      .filter(p => p.riskAssessment.level === 'low')
      .sort((a, b) => a.daysLate - b.daysLate)
      .slice(0, 3)
      .map(p => p.tenantId);

    const atRiskTenants = validProfiles
      .filter(p => p.riskAssessment.level === 'high' || p.riskAssessment.level === 'critical')
      .map(p => p.tenantId);

    const alerts = await Promise.all(
      tenantIds.map(id => this.getPaymentAlerts(id))
    ).then(alertArrays => alertArrays.flat());

    return {
      propertyId,
      totalUnits: tenantIds.length,
      occupiedUnits: validProfiles.length,
      totalMonthlyRent,
      collectedThisMonth,
      outstandingAmount,
      collectionRate,
      averageDaysLate,
      tenantFinancials: validProfiles,
      topPerformingTenants,
      atRiskTenants,
      alerts
    };
  }

  // Helper methods
  private calculateDaysLate(payment: RentPayment): number {
    if (!payment.paidDate || payment.status !== 'completed') {
      return dayjs().diff(dayjs(payment.dueDate), 'day');
    }
    return Math.max(0, dayjs(payment.paidDate).diff(dayjs(payment.dueDate), 'day'));
  }

  private determinePaymentStatus(payments: RentPayment[]): 'current' | 'late' | 'partial' | 'overdue' {
    const currentPayment = payments.find(p => 
      dayjs(p.dueDate).isSame(dayjs(), 'month')
    );

    if (!currentPayment) return 'current';

    switch (currentPayment.status) {
      case 'completed':
        return this.calculateDaysLate(currentPayment) > 0 ? 'late' : 'current';
      case 'partial':
        return 'partial';
      case 'overdue':
        return 'overdue';
      default:
        return dayjs().isAfter(dayjs(currentPayment.dueDate)) ? 'overdue' : 'current';
    }
  }

  private convertAutoPaySetup(setup: any): AutoPayStatus {
    if (!setup) {
      return {
        isEnabled: false,
        status: 'disabled',
        failedAttempts: 0
      };
    }

    return {
      isEnabled: setup.isEnabled,
      paymentMethodId: setup.paymentMethodId,
      status: setup.isEnabled ? 'active' : 'disabled',
      failedAttempts: 0
    };
  }

  private getDefaultNotificationPreferences(): NotificationPreferences {
    return {
      email: {
        enabled: true,
        address: '',
        types: ['payment_reminder', 'payment_confirmation', 'late_payment']
      },
      sms: {
        enabled: false,
        phoneNumber: '',
        types: ['payment_reminder', 'late_payment']
      },
      push: {
        enabled: true,
        types: ['payment_confirmation']
      },
      mail: {
        enabled: false,
        address: '',
        types: []
      }
    };
  }

  // Real-time updates simulation
  private startRealTimeUpdates(): void {
    setInterval(() => {
      // Simulate real-time payment updates
      this.tenantProfiles.forEach(async (profile, tenantId) => {
        await this.updateFinancialProfile(tenantId);
      });
    }, 30000); // Update every 30 seconds
  }

  // Mock data initialization
  private initializeMockData(): void {
    // Initialize with some sample ledger entries
    const mockEntries: LedgerEntry[] = [
      {
        id: 'ledger_1',
        tenantId: 'tenant_1',
        propertyId: 'prop_1',
        date: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
        type: 'rent',
        description: 'Monthly rent payment',
        amount: 2000,
        balance: 0,
        category: 'rent',
        createdBy: 'system',
        createdAt: dayjs().subtract(1, 'month').toISOString()
      }
    ];

    this.ledgerEntries = mockEntries;
  }
}

export const tenantFinancialService = TenantFinancialService.getInstance();
