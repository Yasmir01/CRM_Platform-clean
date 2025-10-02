/**
 * TransUnion Integration Service
 * Handles credit reports and background checks via TransUnion API
 */

export interface CreditReportRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  socialSecurityNumber: string;
  currentAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  email: string;
  phone: string;
  permissiblePurpose: string; // e.g., "Tenant Screening"
}

export interface BackgroundCheckRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  socialSecurityNumber: string;
  currentAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  email: string;
  phone: string;
  searchType: 'standard' | 'comprehensive'; // Level of background check
}

export interface CreditReportResponse {
  reportId: string;
  status: 'pending' | 'completed' | 'failed';
  creditScore?: number;
  reportSummary?: {
    creditScore: number;
    tradelines: number;
    publicRecords: number;
    inquiries: number;
    accountsSummary: {
      total: number;
      open: number;
      closed: number;
    };
  };
  reportUrl?: string;
  errorMessage?: string;
}

export interface BackgroundCheckResponse {
  reportId: string;
  status: 'pending' | 'completed' | 'failed';
  result?: 'clear' | 'review_required' | 'failed';
  findings?: {
    criminal: {
      recordsFound: boolean;
      recordCount: number;
      summary: string;
    };
    eviction: {
      recordsFound: boolean;
      recordCount: number;
      summary: string;
    };
    identity: {
      verified: boolean;
      confidence: 'high' | 'medium' | 'low';
    };
  };
  reportUrl?: string;
  errorMessage?: string;
}

export interface TransUnionConfig {
  apiKey: string;
  apiSecret: string;
  environment: 'sandbox' | 'production';
  baseUrl: string;
}

class TransUnionServiceClass {
  private config: TransUnionConfig | null = null;
  private initialized = false;

  /**
   * Initialize the TransUnion service with configuration
   */
  initialize(config?: Partial<TransUnionConfig>) {
    // Client must not hold vendor credentials; use server endpoint instead
    this.config = {
      apiKey: 'client_disabled',
      apiSecret: 'client_disabled',
      environment: 'sandbox',
      baseUrl: '',
      ...config
    };
    this.initialized = true;
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return this.initialized && 
           this.config !== null && 
           this.config.apiKey !== 'demo_key' &&
           this.config.apiSecret !== 'demo_secret';
  }

  /**
   * Request a credit report from TransUnion
   */
  async requestCreditReport(request: CreditReportRequest): Promise<CreditReportResponse> {
    try {
      const res = await fetch('/api/screening/transunion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicantId: `${request.firstName}-${request.lastName}`.toLowerCase(), ssn: request.socialSecurityNumber })
      });
      if (!res.ok) throw new Error('Screening request failed');
      await res.json();
      return { reportId: `req_${Date.now()}`, status: 'pending' };
    } catch (error) {
      return {
        reportId: `error_${Date.now()}`,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Request a background check from TransUnion
   */
  async requestBackgroundCheck(request: BackgroundCheckRequest): Promise<BackgroundCheckResponse> {
    try {
      const res = await fetch('/api/screening/transunion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicantId: `${request.firstName}-${request.lastName}`.toLowerCase(), ssn: request.socialSecurityNumber })
      });
      if (!res.ok) throw new Error('Screening request failed');
      await res.json();
      return { reportId: `req_${Date.now()}`, status: 'pending' };
    } catch (error) {
      return {
        reportId: `error_${Date.now()}`,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get the status of a credit report
   */
  async getCreditReportStatus(reportId: string): Promise<CreditReportResponse> {
    if (!this.isConfigured()) {
      return this.getMockCreditReportResponse(reportId);
    }

    try {
      const response = await this.makeTransUnionAPICall(`/credit-reports/${reportId}`, 'GET');
      return response;
    } catch (error) {
      console.error('Error getting credit report status:', error);
      return {
        reportId,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get the status of a background check
   */
  async getBackgroundCheckStatus(reportId: string): Promise<BackgroundCheckResponse> {
    if (!this.isConfigured()) {
      return this.getMockBackgroundCheckResponse(reportId);
    }

    try {
      const response = await this.makeTransUnionAPICall(`/background-checks/${reportId}`, 'GET');
      return response;
    } catch (error) {
      console.error('Error getting background check status:', error);
      return {
        reportId,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Make an API call to TransUnion (placeholder implementation)
   */
  private async makeTransUnionAPICall(endpoint: string, method: string, data?: any): Promise<any> {
    throw new Error('Client-side TransUnion API calls are disabled');
  }

  /**
   * Generate mock credit report response for testing
   */
  private getMockCreditReportResponse(reportId?: string): CreditReportResponse {
    const id = reportId || `credit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockScore = Math.floor(Math.random() * (850 - 300) + 300); // Random score between 300-850
    
    return {
      reportId: id,
      status: 'completed',
      creditScore: mockScore,
      reportSummary: {
        creditScore: mockScore,
        tradelines: Math.floor(Math.random() * 15) + 5,
        publicRecords: Math.floor(Math.random() * 3),
        inquiries: Math.floor(Math.random() * 10) + 1,
        accountsSummary: {
          total: Math.floor(Math.random() * 20) + 5,
          open: Math.floor(Math.random() * 15) + 3,
          closed: Math.floor(Math.random() * 10) + 2
        }
      },
      reportUrl: `https://reports.transunion.com/credit/${id}`
    };
  }

  /**
   * Generate mock background check response for testing
   */
  private getMockBackgroundCheckResponse(reportId?: string): BackgroundCheckResponse {
    const id = reportId || `background_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const hasRecords = Math.random() < 0.2; // 20% chance of having records
    
    return {
      reportId: id,
      status: 'completed',
      result: hasRecords ? 'review_required' : 'clear',
      findings: {
        criminal: {
          recordsFound: hasRecords,
          recordCount: hasRecords ? Math.floor(Math.random() * 3) + 1 : 0,
          summary: hasRecords ? 'Minor traffic violations found' : 'No criminal records found'
        },
        eviction: {
          recordsFound: false,
          recordCount: 0,
          summary: 'No eviction records found'
        },
        identity: {
          verified: true,
          confidence: 'high'
        }
      },
      reportUrl: `https://reports.transunion.com/background/${id}`
    };
  }
}

// Export singleton instance
export const TransUnionService = new TransUnionServiceClass();

// Auto-initialize with environment variables
TransUnionService.initialize();

export default TransUnionService;
