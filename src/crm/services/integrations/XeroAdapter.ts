/**
 * Xero Accounting Integration Adapter
 * 
 * Handles OAuth2 authentication and API communication with Xero
 */

import { 
  BookkeepingAdapter, 
  BookkeepingConnection, 
  BookkeepingCustomer, 
  BookkeepingInvoice, 
  BookkeepingPayment, 
  BookkeepingJournalEntry 
} from '../BookkeepingIntegrationService';

export class XeroAdapter extends BookkeepingAdapter {
  private readonly baseUrl = 'https://api.xero.com/api.xro/2.0';
  private readonly authUrl = 'https://login.xero.com/identity/connect/authorize';
  private readonly tokenUrl = 'https://identity.xero.com/connect/token';

  /**
   * Test connection to Xero
   */
  async testConnection(connection: BookkeepingConnection): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest(connection, '/Organisation', 'GET');
      
      if (response.Organisations && response.Organisations.length > 0) {
        const org = response.Organisations[0];
        return {
          success: true,
          message: `Connected to ${org.Name} (${org.CountryCode})`
        };
      } else {
        return {
          success: false,
          message: 'No organizations found in Xero account'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Xero connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Create customer (contact) in Xero
   */
  async createCustomer(connection: BookkeepingConnection, customer: BookkeepingCustomer): Promise<BookkeepingCustomer> {
    const xeroContact = {
      Name: customer.name,
      EmailAddress: customer.email,
      Phones: customer.phone ? [{
        PhoneType: 'MOBILE',
        PhoneNumber: customer.phone
      }] : [],
      Addresses: customer.address ? [{
        AddressType: 'STREET',
        AddressLine1: customer.address.street,
        City: customer.address.city,
        Region: customer.address.state,
        PostalCode: customer.address.zipCode,
        Country: customer.address.country || 'US'
      }] : [],
      ContactStatus: customer.isActive ? 'ACTIVE' : 'ARCHIVED',
      IsCustomer: true
    };

    try {
      const response = await this.makeRequest(connection, '/Contacts', 'POST', {
        Contacts: [xeroContact]
      });

      if (response.Contacts && response.Contacts.length > 0) {
        const createdContact = response.Contacts[0];
        return {
          ...customer,
          externalId: createdContact.ContactID
        };
      }

      throw new Error('Failed to create contact in Xero');
    } catch (error) {
      throw new Error(`Xero customer creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create invoice in Xero
   */
  async createInvoice(connection: BookkeepingConnection, invoice: BookkeepingInvoice): Promise<BookkeepingInvoice> {
    // First, ensure customer exists
    let contactId = invoice.customerId;
    if (!contactId.startsWith('contact_')) {
      // Create customer if doesn't exist
      const customer: BookkeepingCustomer = {
        name: invoice.customerName,
        isActive: true
      };
      const createdCustomer = await this.createCustomer(connection, customer);
      contactId = createdCustomer.externalId!;
    }

    const xeroInvoice = {
      Type: 'ACCREC', // Accounts Receivable
      Contact: {
        ContactID: contactId
      },
      Date: invoice.issueDate,
      DueDate: invoice.dueDate,
      InvoiceNumber: invoice.invoiceNumber,
      Reference: invoice.reference,
      Status: this.mapInvoiceStatus(invoice.status),
      LineItems: invoice.lineItems.map(item => ({
        Description: item.description,
        Quantity: item.quantity,
        UnitAmount: item.unitPrice,
        AccountCode: item.accountCode || '4000', // Default revenue account
        TaxType: item.taxRate ? 'OUTPUT' : 'NONE'
      })),
      Currency: invoice.currency || 'USD'
    };

    try {
      const response = await this.makeRequest(connection, '/Invoices', 'POST', {
        Invoices: [xeroInvoice]
      });

      if (response.Invoices && response.Invoices.length > 0) {
        const createdInvoice = response.Invoices[0];
        return {
          ...invoice,
          externalId: createdInvoice.InvoiceID,
          invoiceNumber: createdInvoice.InvoiceNumber
        };
      }

      throw new Error('Failed to create invoice in Xero');
    } catch (error) {
      throw new Error(`Xero invoice creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create payment in Xero
   */
  async createPayment(connection: BookkeepingConnection, payment: BookkeepingPayment): Promise<BookkeepingPayment> {
    const xeroPayment = {
      Invoice: {
        InvoiceID: payment.invoiceId
      },
      Account: {
        Code: payment.bankAccount || '1100' // Default bank account
      },
      Date: payment.paymentDate,
      Amount: payment.amount,
      Reference: payment.reference,
      PaymentType: 'ACCRECPAYMENT'
    };

    try {
      const response = await this.makeRequest(connection, '/Payments', 'POST', {
        Payments: [xeroPayment]
      });

      if (response.Payments && response.Payments.length > 0) {
        const createdPayment = response.Payments[0];
        return {
          ...payment,
          externalId: createdPayment.PaymentID
        };
      }

      throw new Error('Failed to create payment in Xero');
    } catch (error) {
      throw new Error(`Xero payment creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create journal entry (manual journal) in Xero
   */
  async createJournalEntry(connection: BookkeepingConnection, entry: BookkeepingJournalEntry): Promise<BookkeepingJournalEntry> {
    const xeroJournal = {
      Narration: entry.description,
      Date: entry.date,
      JournalLines: entry.lineItems.map(line => ({
        AccountCode: line.accountCode,
        Description: line.description,
        DebitAmount: line.debitAmount || 0,
        CreditAmount: line.creditAmount || 0
      }))
    };

    try {
      const response = await this.makeRequest(connection, '/ManualJournals', 'POST', {
        ManualJournals: [xeroJournal]
      });

      if (response.ManualJournals && response.ManualJournals.length > 0) {
        const createdJournal = response.ManualJournals[0];
        return {
          ...entry,
          externalId: createdJournal.ManualJournalID,
          status: 'posted'
        };
      }

      throw new Error('Failed to create manual journal in Xero');
    } catch (error) {
      throw new Error(`Xero journal entry creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get financial report from Xero
   */
  async getFinancialReport(
    connection: BookkeepingConnection, 
    reportType: string, 
    startDate: string, 
    endDate: string
  ): Promise<any> {
    const reportEndpoint = this.getReportEndpoint(reportType);
    const params = new URLSearchParams({
      fromDate: startDate,
      toDate: endDate
    });

    try {
      const response = await this.makeRequest(
        connection, 
        `/Reports/${reportEndpoint}?${params}`, 
        'GET'
      );

      return response.Reports?.[0] || response;
    } catch (error) {
      throw new Error(`Xero report retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Initiate OAuth2 authorization flow
   */
  getAuthorizationUrl(clientId: string, redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'accounting.transactions accounting.contacts.read accounting.settings',
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
    tokenType: string;
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
      tokenType: data.token_type
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
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${connection.credentials.accessToken}`,
      'Xero-tenant-id': connection.credentials.organizationId || '',
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
        if (errorData.Elements) {
          errorMessage = errorData.Elements[0]?.ValidationErrors?.[0]?.Message || errorMessage;
        }
      } catch (e) {
        // Use the raw error text if JSON parsing fails
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  }

  private mapInvoiceStatus(status: BookkeepingInvoice['status']): string {
    const statusMap: Record<BookkeepingInvoice['status'], string> = {
      'draft': 'DRAFT',
      'sent': 'SUBMITTED',
      'paid': 'PAID',
      'overdue': 'SUBMITTED',
      'cancelled': 'VOIDED'
    };

    return statusMap[status] || 'DRAFT';
  }

  private getReportEndpoint(reportType: string): string {
    const reportMap: Record<string, string> = {
      'profit_loss': 'ProfitAndLoss',
      'balance_sheet': 'BalanceSheet',
      'cash_flow': 'CashSummary',
      'trial_balance': 'TrialBalance',
      'aged_receivables': 'AgedReceivablesByContact',
      'aged_payables': 'AgedPayablesByContact'
    };

    return reportMap[reportType] || 'ProfitAndLoss';
  }
}

export const xeroAdapter = new XeroAdapter();
