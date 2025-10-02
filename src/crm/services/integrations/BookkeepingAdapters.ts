/**
 * Additional Bookkeeping Adapters
 * 
 * Collection of adapters for various accounting software platforms
 */

import { 
  BookkeepingAdapter, 
  BookkeepingConnection, 
  BookkeepingCustomer, 
  BookkeepingInvoice, 
  BookkeepingPayment, 
  BookkeepingJournalEntry 
} from '../BookkeepingIntegrationService';

/**
 * Sage Business Cloud Accounting Adapter
 */
export class SageAdapter extends BookkeepingAdapter {
  private readonly baseUrl = 'https://api.accounting.sage.com/v3.1';

  async testConnection(connection: BookkeepingConnection): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest(connection, '/user', 'GET');
      return {
        success: true,
        message: `Connected to Sage (User: ${response.email})`
      };
    } catch (error) {
      return {
        success: false,
        message: `Sage connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async createCustomer(connection: BookkeepingConnection, customer: BookkeepingCustomer): Promise<BookkeepingCustomer> {
    const sageContact = {
      contact_type: 'CUSTOMER',
      name: customer.name,
      email: customer.email,
      telephone: customer.phone,
      address: customer.address ? {
        address_line_1: customer.address.street,
        city: customer.address.city,
        region: customer.address.state,
        postal_code: customer.address.zipCode,
        country_code: customer.address.country || 'US'
      } : undefined
    };

    const response = await this.makeRequest(connection, '/contacts', 'POST', sageContact);
    return { ...customer, externalId: response.id };
  }

  async createInvoice(connection: BookkeepingConnection, invoice: BookkeepingInvoice): Promise<BookkeepingInvoice> {
    const sageInvoice = {
      contact_id: invoice.customerId,
      date: invoice.issueDate,
      due_date: invoice.dueDate,
      reference: invoice.invoiceNumber,
      invoice_lines: invoice.lineItems.map(item => ({
        description: item.description,
        quantity: item.quantity.toString(),
        unit_price: item.unitPrice.toString(),
        tax_rate_id: item.taxRate ? 'GB_STANDARD_RATE' : 'GB_NO_TAX'
      }))
    };

    const response = await this.makeRequest(connection, '/sales_invoices', 'POST', sageInvoice);
    return { ...invoice, externalId: response.id };
  }

  async createPayment(connection: BookkeepingConnection, payment: BookkeepingPayment): Promise<BookkeepingPayment> {
    const sagePayment = {
      payment_method_id: this.getPaymentMethodId(payment.paymentMethod),
      date: payment.paymentDate,
      total_amount: payment.amount.toString(),
      reference: payment.reference,
      contact_id: payment.customerId
    };

    const response = await this.makeRequest(connection, '/contact_payments', 'POST', sagePayment);
    return { ...payment, externalId: response.id };
  }

  async createJournalEntry(connection: BookkeepingConnection, entry: BookkeepingJournalEntry): Promise<BookkeepingJournalEntry> {
    const sageJournal = {
      date: entry.date,
      reference: entry.reference,
      description: entry.description,
      journal_lines: entry.lineItems.map(line => ({
        ledger_account_id: this.getAccountId(line.accountCode),
        description: line.description,
        debit: line.debitAmount?.toString(),
        credit: line.creditAmount?.toString()
      }))
    };

    const response = await this.makeRequest(connection, '/journal_entries', 'POST', sageJournal);
    return { ...entry, externalId: response.id, status: 'posted' };
  }

  async getFinancialReport(connection: BookkeepingConnection, reportType: string, startDate: string, endDate: string): Promise<any> {
    const endpoint = `/reports/${this.getReportEndpoint(reportType)}`;
    const params = `?from_date=${startDate}&to_date=${endDate}`;
    return await this.makeRequest(connection, `${endpoint}${params}`, 'GET');
  }

  private async makeRequest(connection: BookkeepingConnection, endpoint: string, method: string, body?: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${connection.credentials.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) throw new Error(`Sage API error: ${response.statusText}`);
    return await response.json();
  }

  private getPaymentMethodId(method: string): string {
    const methodMap: Record<string, string> = {
      'cash': 'CASH',
      'check': 'CHEQUE',
      'credit_card': 'CREDIT_CARD',
      'bank_transfer': 'BANK_TRANSFER'
    };
    return methodMap[method.toLowerCase()] || 'CASH';
  }

  private getAccountId(code: string): string {
    // Simplified mapping - in reality, this would be dynamic
    const accountMap: Record<string, string> = {
      '1100': '1', // Bank
      '1200': '2', // Debtors
      '4000': '3', // Sales
      '4100': '4'  // Other Income
    };
    return accountMap[code] || '1';
  }

  private getReportEndpoint(reportType: string): string {
    const reportMap: Record<string, string> = {
      'profit_loss': 'profit_and_loss',
      'balance_sheet': 'balance_sheet',
      'trial_balance': 'trial_balance'
    };
    return reportMap[reportType] || 'profit_and_loss';
  }
}

/**
 * FreshBooks Adapter
 */
export class FreshBooksAdapter extends BookkeepingAdapter {
  private readonly baseUrl = 'https://api.freshbooks.com';

  async testConnection(connection: BookkeepingConnection): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest(connection, '/auth/api/v1/users/me', 'GET');
      return {
        success: true,
        message: `Connected to FreshBooks (${response.response.email})`
      };
    } catch (error) {
      return {
        success: false,
        message: `FreshBooks connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async createCustomer(connection: BookkeepingConnection, customer: BookkeepingCustomer): Promise<BookkeepingCustomer> {
    const fbClient = {
      organization: customer.name,
      email: customer.email,
      work_phone: customer.phone,
      billing_address: customer.address ? {
        street: customer.address.street,
        city: customer.address.city,
        province: customer.address.state,
        postal_code: customer.address.zipCode,
        country: customer.address.country || 'United States'
      } : undefined
    };

    const response = await this.makeRequest(connection, `/accounting/account/${connection.credentials.companyId}/users/clients`, 'POST', {
      client: fbClient
    });

    return { ...customer, externalId: response.response.id.toString() };
  }

  async createInvoice(connection: BookkeepingConnection, invoice: BookkeepingInvoice): Promise<BookkeepingInvoice> {
    const fbInvoice = {
      clientid: parseInt(invoice.customerId),
      create_date: invoice.issueDate,
      due_date: invoice.dueDate,
      invoice_number: invoice.invoiceNumber,
      notes: invoice.description,
      lines: invoice.lineItems.map(item => ({
        name: item.description,
        qty: item.quantity,
        unit_cost: {
          amount: item.unitPrice.toString(),
          code: invoice.currency || 'USD'
        }
      }))
    };

    const response = await this.makeRequest(connection, `/accounting/account/${connection.credentials.companyId}/invoices/invoices`, 'POST', {
      invoice: fbInvoice
    });

    return { ...invoice, externalId: response.response.id.toString() };
  }

  async createPayment(connection: BookkeepingConnection, payment: BookkeepingPayment): Promise<BookkeepingPayment> {
    const fbPayment = {
      invoiceid: parseInt(payment.invoiceId!),
      amount: {
        amount: payment.amount.toString(),
        code: payment.currency || 'USD'
      },
      date: payment.paymentDate,
      type: this.getPaymentType(payment.paymentMethod),
      note: payment.description
    };

    const response = await this.makeRequest(connection, `/accounting/account/${connection.credentials.companyId}/payments/payments`, 'POST', {
      payment: fbPayment
    });

    return { ...payment, externalId: response.response.id.toString() };
  }

  async createJournalEntry(connection: BookkeepingConnection, entry: BookkeepingJournalEntry): Promise<BookkeepingJournalEntry> {
    // FreshBooks has limited journal entry support
    // This is a simplified implementation
    const fbEntry = {
      description: entry.description,
      notes: entry.reference,
      journal_entry_accounts: entry.lineItems.map(line => ({
        account_type: this.getAccountType(line.accountCode),
        sub_account_type: line.accountCode,
        description: line.description,
        debit: line.debitAmount?.toString(),
        credit: line.creditAmount?.toString()
      }))
    };

    // Note: FreshBooks may not support this endpoint in all plans
    const response = await this.makeRequest(connection, `/accounting/account/${connection.credentials.companyId}/journal_entries/journal_entries`, 'POST', {
      journal_entry: fbEntry
    });

    return { ...entry, externalId: response.response.id?.toString(), status: 'posted' };
  }

  async getFinancialReport(connection: BookkeepingConnection, reportType: string, startDate: string, endDate: string): Promise<any> {
    const endpoint = `/accounting/account/${connection.credentials.companyId}/reports/accounting/${this.getReportEndpoint(reportType)}`;
    const params = `?start_date=${startDate}&end_date=${endDate}`;
    return await this.makeRequest(connection, `${endpoint}${params}`, 'GET');
  }

  private async makeRequest(connection: BookkeepingConnection, endpoint: string, method: string, body?: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${connection.credentials.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) throw new Error(`FreshBooks API error: ${response.statusText}`);
    return await response.json();
  }

  private getPaymentType(method: string): string {
    const typeMap: Record<string, string> = {
      'cash': 'Cash',
      'check': 'Check',
      'credit_card': 'Credit',
      'bank_transfer': 'Bank Transfer'
    };
    return typeMap[method.toLowerCase()] || 'Cash';
  }

  private getAccountType(code: string): string {
    const typeMap: Record<string, string> = {
      '1100': 'asset',
      '1200': 'asset',
      '4000': 'income',
      '4100': 'income',
      '6000': 'expense'
    };
    return typeMap[code] || 'income';
  }

  private getReportEndpoint(reportType: string): string {
    const reportMap: Record<string, string> = {
      'profit_loss': 'profitloss',
      'balance_sheet': 'balance_sheet',
      'trial_balance': 'trial_balance'
    };
    return reportMap[reportType] || 'profitloss';
  }
}

/**
 * Wave Accounting Adapter
 */
export class WaveAdapter extends BookkeepingAdapter {
  private readonly baseUrl = 'https://gql.waveapps.com/graphql/public';

  async testConnection(connection: BookkeepingConnection): Promise<{ success: boolean; message: string }> {
    try {
      const query = `
        query {
          user {
            id
            email
            defaultBusiness {
              id
              name
            }
          }
        }
      `;

      const response = await this.makeGraphQLRequest(connection, query);
      return {
        success: true,
        message: `Connected to Wave (${response.data.user.email})`
      };
    } catch (error) {
      return {
        success: false,
        message: `Wave connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async createCustomer(connection: BookkeepingConnection, customer: BookkeepingCustomer): Promise<BookkeepingCustomer> {
    const mutation = `
      mutation CustomerCreateInput($input: CustomerCreateInput!) {
        customerCreate(input: $input) {
          customer {
            id
          }
          didSucceed
          inputErrors {
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        businessId: connection.credentials.companyId,
        name: customer.name,
        email: customer.email,
        mobile: customer.phone,
        address: customer.address ? {
          addressLine1: customer.address.street,
          city: customer.address.city,
          provinceCode: customer.address.state,
          postalCode: customer.address.zipCode,
          countryCode: customer.address.country || 'US'
        } : undefined
      }
    };

    const response = await this.makeGraphQLRequest(connection, mutation, variables);
    
    if (response.data.customerCreate.didSucceed) {
      return { ...customer, externalId: response.data.customerCreate.customer.id };
    }
    
    throw new Error('Failed to create customer in Wave');
  }

  async createInvoice(connection: BookkeepingConnection, invoice: BookkeepingInvoice): Promise<BookkeepingInvoice> {
    const mutation = `
      mutation InvoiceCreateInput($input: InvoiceCreateInput!) {
        invoiceCreate(input: $input) {
          invoice {
            id
            invoiceNumber
          }
          didSucceed
          inputErrors {
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        businessId: connection.credentials.companyId,
        customerId: invoice.customerId,
        invoiceDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        invoiceNumber: invoice.invoiceNumber,
        memo: invoice.description,
        itemLines: invoice.lineItems.map(item => ({
          product: {
            name: item.description,
            price: item.unitPrice,
            description: item.description
          },
          quantity: item.quantity
        }))
      }
    };

    const response = await this.makeGraphQLRequest(connection, mutation, variables);
    
    if (response.data.invoiceCreate.didSucceed) {
      return { 
        ...invoice, 
        externalId: response.data.invoiceCreate.invoice.id,
        invoiceNumber: response.data.invoiceCreate.invoice.invoiceNumber
      };
    }
    
    throw new Error('Failed to create invoice in Wave');
  }

  async createPayment(connection: BookkeepingConnection, payment: BookkeepingPayment): Promise<BookkeepingPayment> {
    // Wave uses a different approach for payments - they're typically recorded through money transactions
    const mutation = `
      mutation MoneyTransactionCreateInput($input: MoneyTransactionCreateInput!) {
        moneyTransactionCreate(input: $input) {
          transaction {
            id
          }
          didSucceed
          inputErrors {
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        businessId: connection.credentials.companyId,
        externalId: payment.reference,
        date: payment.paymentDate,
        description: payment.description || 'Customer payment',
        notes: `Payment for invoice ${payment.invoiceId}`,
        money: {
          raw: payment.amount,
          currency: payment.currency || 'USD'
        }
      }
    };

    const response = await this.makeGraphQLRequest(connection, mutation, variables);
    
    if (response.data.moneyTransactionCreate.didSucceed) {
      return { ...payment, externalId: response.data.moneyTransactionCreate.transaction.id };
    }
    
    throw new Error('Failed to create payment in Wave');
  }

  async createJournalEntry(connection: BookkeepingConnection, entry: BookkeepingJournalEntry): Promise<BookkeepingJournalEntry> {
    // Wave doesn't have traditional journal entries, but we can create money transactions
    // This is a simplified implementation
    const mutation = `
      mutation MoneyTransactionCreateInput($input: MoneyTransactionCreateInput!) {
        moneyTransactionCreate(input: $input) {
          transaction {
            id
          }
          didSucceed
          inputErrors {
            message
          }
        }
      }
    `;

    // Calculate net amount for the transaction
    const totalDebits = entry.lineItems.reduce((sum, line) => sum + (line.debitAmount || 0), 0);
    const totalCredits = entry.lineItems.reduce((sum, line) => sum + (line.creditAmount || 0), 0);
    const netAmount = totalDebits - totalCredits;

    const variables = {
      input: {
        businessId: connection.credentials.companyId,
        externalId: entry.reference,
        date: entry.date,
        description: entry.description,
        money: {
          raw: Math.abs(netAmount),
          currency: 'USD'
        }
      }
    };

    const response = await this.makeGraphQLRequest(connection, mutation, variables);
    
    if (response.data.moneyTransactionCreate.didSucceed) {
      return { ...entry, externalId: response.data.moneyTransactionCreate.transaction.id, status: 'posted' };
    }
    
    throw new Error('Failed to create journal entry in Wave');
  }

  async getFinancialReport(connection: BookkeepingConnection, reportType: string, startDate: string, endDate: string): Promise<any> {
    // Wave has limited reporting API - this is a simplified implementation
    const query = `
      query BusinessTransactions($businessId: ID!, $startDate: Date!, $endDate: Date!) {
        business(id: $businessId) {
          id
          name
          moneyTransactions(page: 1, pageSize: 100, dateFrom: $startDate, dateTo: $endDate) {
            pageInfo {
              totalCount
            }
            edges {
              node {
                id
                description
                date
                amount {
                  raw
                  currency
                }
              }
            }
          }
        }
      }
    `;

    const variables = {
      businessId: connection.credentials.companyId,
      startDate,
      endDate
    };

    return await this.makeGraphQLRequest(connection, query, variables);
  }

  private async makeGraphQLRequest(connection: BookkeepingConnection, query: string, variables?: any): Promise<any> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${connection.credentials.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    if (!response.ok) throw new Error(`Wave API error: ${response.statusText}`);
    
    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`Wave GraphQL error: ${result.errors[0].message}`);
    }
    
    return result;
  }
}

/**
 * Zoho Books Adapter
 */
export class ZohoBooksAdapter extends BookkeepingAdapter {
  private readonly baseUrl = 'https://books.zoho.com/api/v3';

  async testConnection(connection: BookkeepingConnection): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.makeRequest(connection, '/users/me', 'GET');
      return {
        success: true,
        message: `Connected to Zoho Books (${response.user.email})`
      };
    } catch (error) {
      return {
        success: false,
        message: `Zoho Books connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async createCustomer(connection: BookkeepingConnection, customer: BookkeepingCustomer): Promise<BookkeepingCustomer> {
    const zohoCustomer = {
      contact_name: customer.name,
      contact_type: 'customer',
      email: customer.email,
      phone: customer.phone,
      billing_address: customer.address ? {
        address: customer.address.street,
        city: customer.address.city,
        state: customer.address.state,
        zip: customer.address.zipCode,
        country: customer.address.country || 'US'
      } : undefined
    };

    const response = await this.makeRequest(connection, '/contacts', 'POST', zohoCustomer);
    return { ...customer, externalId: response.contact.contact_id };
  }

  async createInvoice(connection: BookkeepingConnection, invoice: BookkeepingInvoice): Promise<BookkeepingInvoice> {
    const zohoInvoice = {
      customer_id: invoice.customerId,
      invoice_number: invoice.invoiceNumber,
      date: invoice.issueDate,
      due_date: invoice.dueDate,
      reference_number: invoice.reference,
      notes: invoice.description,
      line_items: invoice.lineItems.map(item => ({
        name: item.description,
        description: item.description,
        rate: item.unitPrice,
        quantity: item.quantity
      }))
    };

    const response = await this.makeRequest(connection, '/invoices', 'POST', zohoInvoice);
    return { ...invoice, externalId: response.invoice.invoice_id };
  }

  async createPayment(connection: BookkeepingConnection, payment: BookkeepingPayment): Promise<BookkeepingPayment> {
    const zohoPayment = {
      customer_id: payment.customerId,
      payment_mode: this.getPaymentMode(payment.paymentMethod),
      amount: payment.amount,
      date: payment.paymentDate,
      reference_number: payment.reference,
      description: payment.description,
      invoices: payment.invoiceId ? [{
        invoice_id: payment.invoiceId,
        amount_applied: payment.amount
      }] : []
    };

    const response = await this.makeRequest(connection, '/customerpayments', 'POST', zohoPayment);
    return { ...payment, externalId: response.payment.payment_id };
  }

  async createJournalEntry(connection: BookkeepingConnection, entry: BookkeepingJournalEntry): Promise<BookkeepingJournalEntry> {
    const zohoJournal = {
      journal_date: entry.date,
      reference_number: entry.reference,
      notes: entry.description,
      line_items: entry.lineItems.map(line => ({
        account_id: this.getAccountId(line.accountCode),
        description: line.description,
        debit_or_credit: line.debitAmount ? 'debit' : 'credit',
        amount: line.debitAmount || line.creditAmount
      }))
    };

    const response = await this.makeRequest(connection, '/journals', 'POST', zohoJournal);
    return { ...entry, externalId: response.journal.journal_id, status: 'posted' };
  }

  async getFinancialReport(connection: BookkeepingConnection, reportType: string, startDate: string, endDate: string): Promise<any> {
    const endpoint = `/reports/${this.getReportEndpoint(reportType)}`;
    const params = `?from_date=${startDate}&to_date=${endDate}`;
    return await this.makeRequest(connection, `${endpoint}${params}`, 'GET');
  }

  private async makeRequest(connection: BookkeepingConnection, endpoint: string, method: string, body?: any): Promise<any> {
    const organizationId = connection.credentials.organizationId;
    const url = `${this.baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}organization_id=${organizationId}`;

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Zoho-oauthtoken ${connection.credentials.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) throw new Error(`Zoho Books API error: ${response.statusText}`);
    return await response.json();
  }

  private getPaymentMode(method: string): string {
    const modeMap: Record<string, string> = {
      'cash': 'cash',
      'check': 'check',
      'credit_card': 'creditcard',
      'bank_transfer': 'banktransfer'
    };
    return modeMap[method.toLowerCase()] || 'cash';
  }

  private getAccountId(code: string): string {
    // Simplified mapping - would be dynamic in reality
    const accountMap: Record<string, string> = {
      '1100': '1', // Bank
      '1200': '2', // Accounts Receivable
      '4000': '3', // Revenue
      '4100': '4'  // Other Income
    };
    return accountMap[code] || '1';
  }

  private getReportEndpoint(reportType: string): string {
    const reportMap: Record<string, string> = {
      'profit_loss': 'profitandloss',
      'balance_sheet': 'balancesheet',
      'cash_flow': 'cashflow',
      'trial_balance': 'trialbalance'
    };
    return reportMap[reportType] || 'profitandloss';
  }
}

// Export all adapters
export const sageAdapter = new SageAdapter();
export const freshBooksAdapter = new FreshBooksAdapter();
export const waveAdapter = new WaveAdapter();
export const zohoBooksAdapter = new ZohoBooksAdapter();
