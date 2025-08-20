/**
 * TransUnion Credit Check Service
 * 
 * This service handles integration with TransUnion for credit checks and reporting.
 * In a production environment, this would connect to TransUnion's API endpoints.
 * For demo purposes, this provides mock responses that simulate real credit check data.
 */

export interface CreditCheckRequest {
  firstName: string;
  lastName: string;
  ssn: string;
  dateOfBirth: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  email?: string;
  phone?: string;
  grantorInfo?: {
    firstName: string;
    lastName: string;
    ssn: string;
    email: string;
    phone: string;
    address: string;
  };
}

export interface CreditCheckResponse {
  success: boolean;
  transactionId: string;
  requestDate: string;
  applicant: {
    creditScore: number;
    creditRating: 'Poor' | 'Fair' | 'Good' | 'Very Good' | 'Excellent';
    reportSummary: {
      totalAccounts: number;
      openAccounts: number;
      totalCreditLimit: number;
      totalCurrentBalance: number;
      utilizationRate: number;
      paymentHistory: 'Excellent' | 'Good' | 'Fair' | 'Poor';
      accountsInGoodStanding: number;
      derogatory: number;
      publicRecords: number;
      inquiries: {
        hard: number;
        soft: number;
      };
    };
    riskFactors: string[];
    recommendations: string[];
  };
  grantor?: {
    creditScore: number;
    creditRating: 'Poor' | 'Fair' | 'Good' | 'Very Good' | 'Excellent';
    reportSummary: {
      totalAccounts: number;
      openAccounts: number;
      totalCreditLimit: number;
      totalCurrentBalance: number;
      utilizationRate: number;
      paymentHistory: 'Excellent' | 'Good' | 'Fair' | 'Poor';
      accountsInGoodStanding: number;
      derogatory: number;
      publicRecords: number;
      inquiries: {
        hard: number;
        soft: number;
      };
    };
    riskFactors: string[];
    recommendations: string[];
  };
  error?: string;
}

export interface TransUnionConfig {
  apiKey: string;
  baseUrl: string;
  environment: 'sandbox' | 'production';
  memberNumber: string;
  securityCode: string;
}

class TransUnionService {
  private static instance: TransUnionService;
  private config: TransUnionConfig | null = null;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): TransUnionService {
    if (!TransUnionService.instance) {
      TransUnionService.instance = new TransUnionService();
    }
    return TransUnionService.instance;
  }

  /**
   * Configure TransUnion API connection
   */
  public configure(config: TransUnionConfig): boolean {
    try {
      this.config = config;
      // In production, this would validate the API credentials
      this.isConnected = true;
      console.log('TransUnion service configured successfully');
      return true;
    } catch (error) {
      console.error('Failed to configure TransUnion service:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Check if service is properly configured and connected
   */
  public isServiceConnected(): boolean {
    return this.isConnected && this.config !== null;
  }

  /**
   * Perform credit check for applicant and optional grantor
   */
  public async performCreditCheck(request: CreditCheckRequest): Promise<CreditCheckResponse> {
    if (!this.isServiceConnected()) {
      throw new Error('TransUnion service is not configured. Please configure the service first.');
    }

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, this would make actual API calls to TransUnion
      // For demo, we generate realistic mock data
      const transactionId = `TU_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const applicantCreditData = this.generateMockCreditData(request.firstName, request.lastName, request.ssn);
      
      let grantorCreditData = undefined;
      if (request.grantorInfo) {
        grantorCreditData = this.generateMockCreditData(
          request.grantorInfo.firstName, 
          request.grantorInfo.lastName, 
          request.grantorInfo.ssn
        );
      }

      const response: CreditCheckResponse = {
        success: true,
        transactionId,
        requestDate: new Date().toISOString(),
        applicant: applicantCreditData,
        grantor: grantorCreditData
      };

      // Log the credit check for audit purposes
      this.logCreditCheck(request, response);

      return response;

    } catch (error) {
      console.error('Credit check failed:', error);
      throw new Error(`Credit check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate mock credit data for demo purposes
   */
  private generateMockCreditData(firstName: string, lastName: string, ssn: string) {
    // Generate deterministic but random-appearing data based on SSN
    const seed = parseInt(ssn.replace(/\D/g, '').slice(-4), 10);
    const random = (min: number, max: number) => Math.floor((seed * 9301 + 49297) % 233280 / 233280 * (max - min) + min);
    
    const creditScore = random(580, 850);
    const totalLimit = random(5000, 75000);
    const currentBalance = random(0, Math.floor(totalLimit * 0.8));
    const utilizationRate = Math.round((currentBalance / totalLimit) * 100);
    
    let creditRating: 'Poor' | 'Fair' | 'Good' | 'Very Good' | 'Excellent';
    if (creditScore >= 800) creditRating = 'Excellent';
    else if (creditScore >= 740) creditRating = 'Very Good';
    else if (creditScore >= 670) creditRating = 'Good';
    else if (creditScore >= 580) creditRating = 'Fair';
    else creditRating = 'Poor';

    const riskFactors = [];
    const recommendations = [];

    if (utilizationRate > 30) {
      riskFactors.push('High credit utilization ratio');
      recommendations.push('Consider paying down existing balances to improve credit utilization');
    }

    if (creditScore < 650) {
      riskFactors.push('Below average credit score');
      recommendations.push('Consider requiring additional security deposit or guarantor');
    }

    const derogatory = creditScore < 600 ? random(1, 3) : 0;
    if (derogatory > 0) {
      riskFactors.push('Derogatory accounts present');
    }

    return {
      creditScore,
      creditRating,
      reportSummary: {
        totalAccounts: random(5, 20),
        openAccounts: random(3, 12),
        totalCreditLimit: totalLimit,
        totalCurrentBalance: currentBalance,
        utilizationRate,
        paymentHistory: creditScore > 700 ? 'Excellent' : creditScore > 650 ? 'Good' : creditScore > 600 ? 'Fair' : 'Poor',
        accountsInGoodStanding: random(3, 15),
        derogatory,
        publicRecords: creditScore < 600 ? random(0, 2) : 0,
        inquiries: {
          hard: random(0, 5),
          soft: random(2, 10)
        }
      },
      riskFactors,
      recommendations
    };
  }

  /**
   * Log credit check for audit and compliance
   */
  private logCreditCheck(request: CreditCheckRequest, response: CreditCheckResponse): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      transactionId: response.transactionId,
      applicant: {
        name: `${request.firstName} ${request.lastName}`,
        ssn: this.maskSSN(request.ssn),
        creditScore: response.applicant.creditScore
      },
      grantor: request.grantorInfo ? {
        name: `${request.grantorInfo.firstName} ${request.grantorInfo.lastName}`,
        ssn: this.maskSSN(request.grantorInfo.ssn),
        creditScore: response.grantor?.creditScore
      } : null,
      environment: this.config?.environment || 'unknown'
    };

    // In production, this would be sent to a secure logging service
    console.log('Credit check logged:', logEntry);
    
    // Store in localStorage for demo purposes
    const existingLogs = JSON.parse(localStorage.getItem('creditCheckLogs') || '[]');
    existingLogs.push(logEntry);
    localStorage.setItem('creditCheckLogs', JSON.stringify(existingLogs.slice(-100))); // Keep last 100 logs
  }

  /**
   * Mask SSN for logging purposes
   */
  private maskSSN(ssn: string): string {
    return ssn.replace(/\d{3}-\d{2}-(\d{4})/, 'XXX-XX-$1');
  }

  /**
   * Get credit check logs for compliance and audit
   */
  public getCreditCheckLogs(): any[] {
    return JSON.parse(localStorage.getItem('creditCheckLogs') || '[]');
  }

  /**
   * Test TransUnion connection
   */
  public async testConnection(): Promise<boolean> {
    if (!this.config) {
      throw new Error('Service not configured');
    }

    try {
      // In production, this would ping TransUnion's test endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  /**
   * Disconnect from TransUnion service
   */
  public disconnect(): void {
    this.config = null;
    this.isConnected = false;
    console.log('TransUnion service disconnected');
  }
}

export default TransUnionService;
