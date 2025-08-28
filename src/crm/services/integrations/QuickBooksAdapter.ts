/**
 * QuickBooks Online Integration Adapter
 * 
 * Handles OAuth2 authentication and API communication with QuickBooks Online (Intuit)
 */

import { 
  BookkeepingAdapter, 
  BookkeepingConnection, 
  BookkeepingCustomer, 
  BookkeepingInvoice, 
  BookkeepingPayment, 
  BookkeepingJournalEntry 
} from '../BookkeepingIntegrationService';

export class QuickBooksAdapter extends BookkeepingAdapter {
  private readonly baseUrl = 'https://sandbox-quickbooks.api.intuit.com/v3/company';
  private readonly prodBaseUrl = 'https://quickbooks.api.intuit.com/v3/company';
  private readonly authUrl = 'https://appcenter.intuit.com/connect/oauth2';
  private readonly tokenUrl = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';

  /**
   * Test connection to QuickBooks Online
   */
  async testConnection(connection: BookkeepingConnection): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest(connection, '/companyinfo/1', 'GET');
      
      if (response.QueryResponse && response.QueryResponse.CompanyInfo) {
        const company = response.QueryResponse.CompanyInfo[0];
        return {
          success: true,
          message: `Connected to ${company.CompanyName} (${company.Country})`
        };
      } else {
        return {
          success: false,
          message: 'Unable to retrieve company information'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `QuickBooks connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Create customer in QuickBooks Online
   */
  async createCustomer(connection: BookkeepingConnection, customer: BookkeepingCustomer): Promise<BookkeepingCustomer> {
    const qbCustomer = {
      FullyQualifiedName: customer.name,
      Name: customer.name,
      CompanyName: customer.name,
      PrimaryEmailAddr: customer.email ? {
        Address: customer.email
      } : undefined,
      PrimaryPhone: customer.phone ? {
        FreeFormNumber: customer.phone
      } : undefined,
      BillAddr: customer.address ? {
        Line1: customer.address.street,
        City: customer.address.city,
        CountrySubDivisionCode: customer.address.state,
        PostalCode: customer.address.zipCode,
        Country: customer.address.country || 'US'
      } : undefined,
      Active: customer.isActive,
      CustomerTypeRef: {
        value: '1' // Default customer type
      }
    };

    try {
      const response = await this.makeRequest(connection, '/customer', 'POST', {
        Customer: qbCustomer
      });

      if (response.QueryResponse && response.QueryResponse.Customer) {
        const createdCustomer = response.QueryResponse.Customer[0];
        return {
          ...customer,
          externalId: createdCustomer.Id
        };
      }

      throw new Error('Failed to create customer in QuickBooks');
    } catch (error) {
      throw new Error(`QuickBooks customer creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create invoice in QuickBooks Online
   */
  async createInvoice(connection: BookkeepingConnection, invoice: BookkeepingInvoice): Promise<BookkeepingInvoice> {
    // First, ensure customer exists
    let customerId = invoice.customerId;
    if (!customerId.match(/^\d+$/)) {
      // Create customer if doesn't exist or ID is not numeric
      const customer: BookkeepingCustomer = {
        name: invoice.customerName,
        isActive: true
      };
      const createdCustomer = await this.createCustomer(connection, customer);
      customerId = createdCustomer.externalId!;
    }

    const qbInvoice = {
      DocNumber: invoice.invoiceNumber,
      TxnDate: invoice.issueDate,
      DueDate: invoice.dueDate,
      CustomerRef: {
        value: customerId
      },
      Line: invoice.lineItems.map((item, index) => ({
        Id: (index + 1).toString(),
        LineNum: index + 1,
        Amount: item.totalAmount,
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          ItemRef: {
            value: '1', // Default service item
            name: 'Services'
          },
          UnitPrice: item.unitPrice,
          Qty: item.quantity,
          ServiceDate: invoice.issueDate,
          TaxCodeRef: item.taxRate ? {
            value: 'TAX'
          } : {
            value: 'NON'
          }
        }
      })),
      CustomerMemo: {
        value: invoice.description || ''
      },
      PrivateNote: invoice.reference || ''
    };

    try {
      const response = await this.makeRequest(connection, '/invoice', 'POST', {
        Invoice: qbInvoice
      });

      if (response.QueryResponse && response.QueryResponse.Invoice) {
        const createdInvoice = response.QueryResponse.Invoice[0];
        return {
          ...invoice,
          externalId: createdInvoice.Id,
          invoiceNumber: createdInvoice.DocNumber
        };
      }

      throw new Error('Failed to create invoice in QuickBooks');
    } catch (error) {
      throw new Error(`QuickBooks invoice creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create payment in QuickBooks Online
   */
  async createPayment(connection: BookkeepingConnection, payment: BookkeepingPayment): Promise<BookkeepingPayment> {
    const qbPayment = {
      TxnDate: payment.paymentDate,
      TotalAmt: payment.amount,
      CustomerRef: {
        value: payment.customerId
      },
      DepositToAccountRef: {
        value: this.getDepositAccountId(payment.bankAccount)
      },
      PaymentMethodRef: {
        value: this.getPaymentMethodId(payment.paymentMethod)
      },
      Line: payment.invoiceId ? [{
        Amount: payment.amount,
        LinkedTxn: [{
          TxnId: payment.invoiceId,
          TxnType: 'Invoice'
        }]
      }] : [],
      PrivateNote: payment.description || '',
      PaymentRefNum: payment.reference || ''
    };

    try {
      const response = await this.makeRequest(connection, '/payment', 'POST', {
        Payment: qbPayment
      });

      if (response.QueryResponse && response.QueryResponse.Payment) {
        const createdPayment = response.QueryResponse.Payment[0];
        return {
          ...payment,
          externalId: createdPayment.Id
        };
      }

      throw new Error('Failed to create payment in QuickBooks');
    } catch (error) {
      throw new Error(`QuickBooks payment creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create journal entry in QuickBooks Online
   */
  async createJournalEntry(connection: BookkeepingConnection, entry: BookkeepingJournalEntry): Promise<BookkeepingJournalEntry> {
    const qbJournalEntry = {
      TxnDate: entry.date,
      PrivateNote: entry.description,
      DocNumber: entry.reference,
      Line: entry.lineItems.map((line, index) => ({
        Id: (index + 1).toString(),
        Description: line.description,
        Amount: line.debitAmount || line.creditAmount || 0,
        DetailType: 'JournalEntryLineDetail',
        JournalEntryLineDetail: {
          PostingType: line.debitAmount ? 'Debit' : 'Credit',
          AccountRef: {
            value: this.getAccountIdByCode(line.accountCode)
          }
        }
      }))
    };

    try {
      const response = await this.makeRequest(connection, '/journalentry', 'POST', {
        JournalEntry: qbJournalEntry
      });

      if (response.QueryResponse && response.QueryResponse.JournalEntry) {
        const createdEntry = response.QueryResponse.JournalEntry[0];
        return {
          ...entry,
          externalId: createdEntry.Id,
          status: 'posted'
        };
      }

      throw new Error('Failed to create journal entry in QuickBooks');
    } catch (error) {
      throw new Error(`QuickBooks journal entry creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get financial report from QuickBooks Online
   */
  async getFinancialReport(
    connection: BookkeepingConnection, 
    reportType: string, 
    startDate: string, 
    endDate: string
  ): Promise<any> {
    const reportEndpoint = this.getReportEndpoint(reportType);
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      summarize_column_by: 'Month'
    });

    try {
      const response = await this.makeRequest(
        connection, 
        `/reports/${reportEndpoint}?${params}`, 
        'GET'
      );

      return response;
    } catch (error) {
      throw new Error(`QuickBooks report retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get chart of accounts
   */
  async getChartOfAccounts(connection: BookkeepingConnection): Promise<any[]> {
    try {
      const response = await this.makeRequest(
        connection, 
        `/query?query=SELECT * FROM Account`, 
        'GET'
      );

      return response.QueryResponse?.Account || [];
    } catch (error) {
      throw new Error(`Failed to retrieve chart of accounts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get payment methods
   */
  async getPaymentMethods(connection: BookkeepingConnection): Promise<any[]> {
    try {
      const response = await this.makeRequest(
        connection, 
        `/query?query=SELECT * FROM PaymentMethod`, 
        'GET'
      );

      return response.QueryResponse?.PaymentMethod || [];
    } catch (error) {
      throw new Error(`Failed to retrieve payment methods: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Initiate OAuth2 authorization flow
   */
  getAuthorizationUrl(clientId: string, redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      client_id: clientId,
      scope: 'com.intuit.quickbooks.accounting',
      redirect_uri: redirectUri,
      response_type: 'code',
      access_type: 'offline',
      state: state
    });

    return `${this.authUrl}?${params}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForTokens(
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    companyId: string;
  }> {
    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      companyId: data.realmId
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(
    clientId: string,
    clientSecret: string,
    refreshToken: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token refresh failed: ${error}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in
    };
  }

  // Private helper methods
  private async makeRequest(
    connection: BookkeepingConnection,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: any
  ): Promise<any> {
    const baseUrl = connection.credentials.sandboxMode !== false ? this.baseUrl : this.prodBaseUrl;
    const companyId = connection.credentials.companyId;
    const url = `${baseUrl}/${companyId}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${connection.credentials.accessToken}`,
      'Accept': 'application/json'
    };

    if (method !== 'GET' && body) {
      headers['Content-Type'] = 'application/json';
    }

    const config: RequestInit = {
      method,
      headers
    };

    if (method !== 'GET' && body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.Fault && errorData.Fault.Error) {
          errorMessage = errorData.Fault.Error[0]?.Detail || errorMessage;
        }
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  }

  private getDepositAccountId(bankAccount?: string): string {
    // Map bank account codes to QuickBooks account IDs
    const accountMap: Record<string, string> = {
      '1100': '35', // Checking Account
      '1110': '36', // Savings Account
      '1200': '37', // Accounts Receivable
    };

    return accountMap[bankAccount || '1100'] || '35';
  }

  private getPaymentMethodId(paymentMethod: string): string {
    // Map payment methods to QuickBooks payment method IDs
    const methodMap: Record<string, string> = {
      'cash': '1',
      'check': '2',
      'credit_card': '3',
      'bank_transfer': '4',
      'ach': '5'
    };

    return methodMap[paymentMethod.toLowerCase()] || '1';
  }

  private getAccountIdByCode(accountCode: string): string {
    // Map account codes to QuickBooks account IDs
    // This would typically be dynamic based on the company's chart of accounts
    const accountMap: Record<string, string> = {
      '1100': '35', // Bank Account
      '1200': '84', // Accounts Receivable
      '2000': '37', // Accounts Payable
      '4000': '1',  // Revenue
      '4100': '2',  // Other Income
      '6000': '80', // Expense
    };

    return accountMap[accountCode] || '1';
  }

  private getReportEndpoint(reportType: string): string {
    const reportMap: Record<string, string> = {
      'profit_loss': 'ProfitAndLoss',
      'balance_sheet': 'BalanceSheet',
      'cash_flow': 'CashFlow',
      'trial_balance': 'TrialBalance',
      'aged_receivables': 'AgedReceivables',
      'aged_payables': 'AgedPayables'
    };

    return reportMap[reportType] || 'ProfitAndLoss';
  }
}

export const quickBooksAdapter = new QuickBooksAdapter();
