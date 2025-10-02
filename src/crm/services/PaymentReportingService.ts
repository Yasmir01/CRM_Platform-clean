import { RentPayment, PaymentMethod, PaymentReport } from '../types/PaymentTypes';
import dayjs from 'dayjs';

export interface PaymentAnalytics {
  collectionRate: number;
  averagePaymentTime: number;
  totalCollected: number;
  totalOutstanding: number;
  paymentMethodDistribution: Record<string, number>;
  monthlyTrends: MonthlyTrend[];
  topPerformingProperties: PropertyPerformance[];
  underperformingTenants: TenantPerformance[];
  latePaymentAnalysis: LatePaymentStats;
  cashFlowProjection: CashFlowProjection[];
}

export interface MonthlyTrend {
  month: string;
  collected: number;
  due: number;
  collectionRate: number;
  averageDaysLate: number;
}

export interface PropertyPerformance {
  propertyId: string;
  propertyName: string;
  collectionRate: number;
  totalCollected: number;
  totalDue: number;
  onTimePayments: number;
  latePayments: number;
  averageDaysLate: number;
}

export interface TenantPerformance {
  tenantId: string;
  tenantName: string;
  totalPayments: number;
  onTimePayments: number;
  latePayments: number;
  averageDaysLate: number;
  totalAmountDue: number;
  totalAmountPaid: number;
  riskScore: number;
}

export interface LatePaymentStats {
  totalLatePayments: number;
  averageDaysLate: number;
  latePaymentsByMonth: Record<string, number>;
  lateFeeCollected: number;
  topReasons: LatePaymentReason[];
}

export interface LatePaymentReason {
  reason: string;
  count: number;
  percentage: number;
}

export interface CashFlowProjection {
  month: string;
  expectedIncome: number;
  projectedCollectionRate: number;
  estimatedCollection: number;
  outstandingBalance: number;
}

export interface CustomReportFilters {
  dateRange: {
    start: string;
    end: string;
  };
  propertyIds?: string[];
  tenantIds?: string[];
  paymentStatus?: RentPayment['status'][];
  paymentMethods?: PaymentMethod['type'][];
  amountRange?: {
    min: number;
    max: number;
  };
}

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  includeCharts: boolean;
  includeDetails: boolean;
  groupBy: 'tenant' | 'property' | 'month' | 'payment_method';
}

export class PaymentReportingService {
  private static instance: PaymentReportingService;
  private payments: RentPayment[] = [];
  private paymentMethods: PaymentMethod[] = [];

  private constructor() {}

  public static getInstance(): PaymentReportingService {
    if (!PaymentReportingService.instance) {
      PaymentReportingService.instance = new PaymentReportingService();
    }
    return PaymentReportingService.instance;
  }

  // Set data sources
  setPayments(payments: RentPayment[]): void {
    this.payments = payments;
  }

  setPaymentMethods(methods: PaymentMethod[]): void {
    this.paymentMethods = methods;
  }

  // Main Analytics Generation
  async generatePaymentAnalytics(filters?: CustomReportFilters): Promise<PaymentAnalytics> {
    const filteredPayments = this.applyFilters(this.payments, filters);
    
    const collectionRate = this.calculateCollectionRate(filteredPayments);
    const averagePaymentTime = this.calculateAveragePaymentTime(filteredPayments);
    const amounts = this.calculateAmounts(filteredPayments);
    const paymentMethodDistribution = this.calculatePaymentMethodDistribution(filteredPayments);
    const monthlyTrends = this.calculateMonthlyTrends(filteredPayments);
    const topPerformingProperties = this.calculatePropertyPerformance(filteredPayments);
    const underperformingTenants = this.calculateTenantPerformance(filteredPayments);
    const latePaymentAnalysis = this.calculateLatePaymentStats(filteredPayments);
    const cashFlowProjection = this.generateCashFlowProjection(filteredPayments);

    return {
      collectionRate,
      averagePaymentTime,
      totalCollected: amounts.collected,
      totalOutstanding: amounts.outstanding,
      paymentMethodDistribution,
      monthlyTrends,
      topPerformingProperties,
      underperformingTenants,
      latePaymentAnalysis,
      cashFlowProjection
    };
  }

  // Collection Rate Analysis
  private calculateCollectionRate(payments: RentPayment[]): number {
    if (payments.length === 0) return 0;
    
    const totalDue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalCollected = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    return totalDue > 0 ? (totalCollected / totalDue) * 100 : 0;
  }

  // Average Payment Time Analysis
  private calculateAveragePaymentTime(payments: RentPayment[]): number {
    const paidPayments = payments.filter(p => p.status === 'completed' && p.paidDate);
    
    if (paidPayments.length === 0) return 0;
    
    const totalDays = paidPayments.reduce((sum, p) => {
      const dueDate = dayjs(p.dueDate);
      const paidDate = dayjs(p.paidDate);
      const daysDifference = paidDate.diff(dueDate, 'day');
      return sum + daysDifference;
    }, 0);
    
    return totalDays / paidPayments.length;
  }

  // Amount Calculations
  private calculateAmounts(payments: RentPayment[]): { collected: number; outstanding: number } {
    const collected = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const outstanding = payments
      .filter(p => p.status !== 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    return { collected, outstanding };
  }

  // Payment Method Distribution
  private calculatePaymentMethodDistribution(payments: RentPayment[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    const paidPayments = payments.filter(p => p.status === 'completed' && p.paymentMethodId);
    
    paidPayments.forEach(payment => {
      const method = this.paymentMethods.find(m => m.id === payment.paymentMethodId);
      const methodType = method?.type || 'unknown';
      distribution[methodType] = (distribution[methodType] || 0) + payment.amount;
    });
    
    return distribution;
  }

  // Monthly Trends Analysis
  private calculateMonthlyTrends(payments: RentPayment[]): MonthlyTrend[] {
    const monthlyData: Record<string, { collected: number; due: number; lateDays: number[] }> = {};
    
    payments.forEach(payment => {
      const month = dayjs(payment.dueDate).format('YYYY-MM');
      
      if (!monthlyData[month]) {
        monthlyData[month] = { collected: 0, due: 0, lateDays: [] };
      }
      
      monthlyData[month].due += payment.amount;
      
      if (payment.status === 'completed') {
        monthlyData[month].collected += payment.amount;
        
        if (payment.paidDate) {
          const dueDate = dayjs(payment.dueDate);
          const paidDate = dayjs(payment.paidDate);
          const daysLate = Math.max(0, paidDate.diff(dueDate, 'day'));
          monthlyData[month].lateDays.push(daysLate);
        }
      }
    });
    
    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        collected: data.collected,
        due: data.due,
        collectionRate: data.due > 0 ? (data.collected / data.due) * 100 : 0,
        averageDaysLate: data.lateDays.length > 0 
          ? data.lateDays.reduce((sum, days) => sum + days, 0) / data.lateDays.length 
          : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  // Property Performance Analysis
  private calculatePropertyPerformance(payments: RentPayment[]): PropertyPerformance[] {
    const propertyData: Record<string, {
      payments: RentPayment[];
      collected: number;
      due: number;
      onTime: number;
      late: number;
      lateDays: number[];
    }> = {};
    
    payments.forEach(payment => {
      const propertyId = payment.propertyId;
      
      if (!propertyData[propertyId]) {
        propertyData[propertyId] = {
          payments: [],
          collected: 0,
          due: 0,
          onTime: 0,
          late: 0,
          lateDays: []
        };
      }
      
      const data = propertyData[propertyId];
      data.payments.push(payment);
      data.due += payment.amount;
      
      if (payment.status === 'completed') {
        data.collected += payment.amount;
        
        if (payment.paidDate) {
          const dueDate = dayjs(payment.dueDate);
          const paidDate = dayjs(payment.paidDate);
          const daysLate = paidDate.diff(dueDate, 'day');
          
          if (daysLate <= 0) {
            data.onTime++;
          } else {
            data.late++;
            data.lateDays.push(daysLate);
          }
        }
      }
    });
    
    return Object.entries(propertyData)
      .map(([propertyId, data]) => ({
        propertyId,
        propertyName: `Property ${propertyId}`, // In real app, fetch from property service
        collectionRate: data.due > 0 ? (data.collected / data.due) * 100 : 0,
        totalCollected: data.collected,
        totalDue: data.due,
        onTimePayments: data.onTime,
        latePayments: data.late,
        averageDaysLate: data.lateDays.length > 0 
          ? data.lateDays.reduce((sum, days) => sum + days, 0) / data.lateDays.length 
          : 0
      }))
      .sort((a, b) => b.collectionRate - a.collectionRate);
  }

  // Tenant Performance Analysis
  private calculateTenantPerformance(payments: RentPayment[]): TenantPerformance[] {
    const tenantData: Record<string, {
      payments: RentPayment[];
      totalDue: number;
      totalPaid: number;
      onTime: number;
      late: number;
      lateDays: number[];
    }> = {};
    
    payments.forEach(payment => {
      const tenantId = payment.tenantId;
      
      if (!tenantData[tenantId]) {
        tenantData[tenantId] = {
          payments: [],
          totalDue: 0,
          totalPaid: 0,
          onTime: 0,
          late: 0,
          lateDays: []
        };
      }
      
      const data = tenantData[tenantId];
      data.payments.push(payment);
      data.totalDue += payment.amount;
      
      if (payment.status === 'completed') {
        data.totalPaid += payment.amount;
        
        if (payment.paidDate) {
          const dueDate = dayjs(payment.dueDate);
          const paidDate = dayjs(payment.paidDate);
          const daysLate = paidDate.diff(dueDate, 'day');
          
          if (daysLate <= 0) {
            data.onTime++;
          } else {
            data.late++;
            data.lateDays.push(daysLate);
          }
        }
      }
    });
    
    return Object.entries(tenantData)
      .map(([tenantId, data]) => {
        const totalPayments = data.onTime + data.late;
        const averageDaysLate = data.lateDays.length > 0 
          ? data.lateDays.reduce((sum, days) => sum + days, 0) / data.lateDays.length 
          : 0;
        
        // Calculate risk score based on payment history
        const latePaymentRate = totalPayments > 0 ? data.late / totalPayments : 0;
        const collectionRate = data.totalDue > 0 ? data.totalPaid / data.totalDue : 1;
        const riskScore = (latePaymentRate * 0.6) + ((1 - collectionRate) * 0.4) + (averageDaysLate / 30 * 0.2);
        
        return {
          tenantId,
          tenantName: `Tenant ${tenantId}`, // In real app, fetch from tenant service
          totalPayments,
          onTimePayments: data.onTime,
          latePayments: data.late,
          averageDaysLate,
          totalAmountDue: data.totalDue,
          totalAmountPaid: data.totalPaid,
          riskScore: Math.min(1, riskScore)
        };
      })
      .sort((a, b) => b.riskScore - a.riskScore);
  }

  // Late Payment Statistics
  private calculateLatePaymentStats(payments: RentPayment[]): LatePaymentStats {
    const latePayments = payments.filter(p => {
      if (p.status !== 'completed' || !p.paidDate) return false;
      const dueDate = dayjs(p.dueDate);
      const paidDate = dayjs(p.paidDate);
      return paidDate.isAfter(dueDate);
    });
    
    const lateDays = latePayments.map(p => {
      const dueDate = dayjs(p.dueDate);
      const paidDate = dayjs(p.paidDate!);
      return paidDate.diff(dueDate, 'day');
    });
    
    const averageDaysLate = lateDays.length > 0 
      ? lateDays.reduce((sum, days) => sum + days, 0) / lateDays.length 
      : 0;
    
    const latePaymentsByMonth: Record<string, number> = {};
    latePayments.forEach(payment => {
      const month = dayjs(payment.dueDate).format('YYYY-MM');
      latePaymentsByMonth[month] = (latePaymentsByMonth[month] || 0) + 1;
    });
    
    const lateFeeCollected = payments
      .filter(p => p.lateFee && p.lateFee > 0)
      .reduce((sum, p) => sum + (p.lateFee || 0), 0);
    
    // Mock late payment reasons (in real app, this would come from tenant feedback or analysis)
    const topReasons: LatePaymentReason[] = [
      { reason: 'Financial hardship', count: Math.floor(latePayments.length * 0.4), percentage: 40 },
      { reason: 'Forgot due date', count: Math.floor(latePayments.length * 0.25), percentage: 25 },
      { reason: 'Technical issues', count: Math.floor(latePayments.length * 0.15), percentage: 15 },
      { reason: 'Payment method failed', count: Math.floor(latePayments.length * 0.12), percentage: 12 },
      { reason: 'Other', count: Math.floor(latePayments.length * 0.08), percentage: 8 }
    ];
    
    return {
      totalLatePayments: latePayments.length,
      averageDaysLate,
      latePaymentsByMonth,
      lateFeeCollected,
      topReasons
    };
  }

  // Cash Flow Projection
  private generateCashFlowProjection(payments: RentPayment[]): CashFlowProjection[] {
    const currentDate = dayjs();
    const projections: CashFlowProjection[] = [];
    
    // Generate projections for next 12 months
    for (let i = 0; i < 12; i++) {
      const projectionMonth = currentDate.add(i, 'month').format('YYYY-MM');
      
      // Calculate historical collection rate for this month of year
      const historicalPayments = payments.filter(p => 
        dayjs(p.dueDate).format('MM') === currentDate.add(i, 'month').format('MM')
      );
      
      const historicalCollectionRate = this.calculateCollectionRate(historicalPayments);
      
      // Estimate expected income (in real app, this would come from lease data)
      const expectedIncome = payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0) / 12; // Simplified estimation
      
      const estimatedCollection = expectedIncome * (historicalCollectionRate / 100);
      
      // Calculate outstanding balance trend
      const outstandingBalance = payments
        .filter(p => p.status !== 'completed')
        .reduce((sum, p) => sum + p.amount, 0) * (1 - i * 0.1); // Simplified trend
      
      projections.push({
        month: projectionMonth,
        expectedIncome,
        projectedCollectionRate: historicalCollectionRate,
        estimatedCollection,
        outstandingBalance: Math.max(0, outstandingBalance)
      });
    }
    
    return projections;
  }

  // Filter Application
  private applyFilters(payments: RentPayment[], filters?: CustomReportFilters): RentPayment[] {
    if (!filters) return payments;
    
    return payments.filter(payment => {
      // Date range filter
      if (filters.dateRange) {
        const paymentDate = dayjs(payment.dueDate);
        const startDate = dayjs(filters.dateRange.start);
        const endDate = dayjs(filters.dateRange.end);
        
        if (paymentDate.isBefore(startDate) || paymentDate.isAfter(endDate)) {
          return false;
        }
      }
      
      // Property filter
      if (filters.propertyIds && !filters.propertyIds.includes(payment.propertyId)) {
        return false;
      }
      
      // Tenant filter
      if (filters.tenantIds && !filters.tenantIds.includes(payment.tenantId)) {
        return false;
      }
      
      // Status filter
      if (filters.paymentStatus && !filters.paymentStatus.includes(payment.status)) {
        return false;
      }
      
      // Amount range filter
      if (filters.amountRange) {
        if (payment.amount < filters.amountRange.min || payment.amount > filters.amountRange.max) {
          return false;
        }
      }
      
      // Payment method filter
      if (filters.paymentMethods && payment.paymentMethodId) {
        const method = this.paymentMethods.find(m => m.id === payment.paymentMethodId);
        if (!method || !filters.paymentMethods.includes(method.type)) {
          return false;
        }
      }
      
      return true;
    });
  }

  // Export Functionality
  async exportReport(
    analytics: PaymentAnalytics,
    filters: CustomReportFilters,
    options: ExportOptions
  ): Promise<{ success: boolean; downloadUrl?: string; error?: string }> {
    try {
      // In a real implementation, this would generate the actual file
      console.log('Generating export with options:', options);
      
      const fileName = `payment_report_${dayjs().format('YYYY-MM-DD')}.${options.format}`;
      const mockDownloadUrl = `https://example.com/downloads/${fileName}`;
      
      // Simulate export processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        downloadUrl: mockDownloadUrl
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed'
      };
    }
  }

  // Scheduled Report Generation
  async generateScheduledReport(
    reportType: 'daily' | 'weekly' | 'monthly',
    recipients: string[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Generate report for the appropriate period
      const endDate = dayjs().format('YYYY-MM-DD');
      let startDate: string;
      
      switch (reportType) {
        case 'daily':
          startDate = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
          break;
        case 'weekly':
          startDate = dayjs().subtract(1, 'week').format('YYYY-MM-DD');
          break;
        case 'monthly':
          startDate = dayjs().subtract(1, 'month').format('YYYY-MM-DD');
          break;
      }
      
      const filters: CustomReportFilters = {
        dateRange: { start: startDate, end: endDate }
      };
      
      const analytics = await this.generatePaymentAnalytics(filters);
      
      // In a real implementation, this would send the report via email
      console.log(`Sending ${reportType} report to:`, recipients);
      console.log('Report data:', analytics);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Report generation failed'
      };
    }
  }

  // Benchmark Analysis
  async generateBenchmarkAnalysis(): Promise<{
    industryAverages: Record<string, number>;
    performanceComparison: Record<string, { current: number; industry: number; status: 'above' | 'below' | 'at' }>;
  }> {
    // Mock industry benchmarks (in real app, this would come from industry data sources)
    const industryAverages = {
      collectionRate: 94.5,
      averagePaymentTime: 2.3,
      latePaymentRate: 8.2,
      averageDaysLate: 5.8
    };
    
    const currentAnalytics = await this.generatePaymentAnalytics();
    
    const performanceComparison = {
      collectionRate: {
        current: currentAnalytics.collectionRate,
        industry: industryAverages.collectionRate,
        status: currentAnalytics.collectionRate >= industryAverages.collectionRate ? 'above' : 'below' as const
      },
      averagePaymentTime: {
        current: currentAnalytics.averagePaymentTime,
        industry: industryAverages.averagePaymentTime,
        status: currentAnalytics.averagePaymentTime <= industryAverages.averagePaymentTime ? 'above' : 'below' as const
      }
    };
    
    return {
      industryAverages,
      performanceComparison
    };
  }
}

export const paymentReportingService = PaymentReportingService.getInstance();
