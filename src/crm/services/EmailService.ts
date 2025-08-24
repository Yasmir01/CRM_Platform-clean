export interface EmailProvider {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  authType: 'oauth' | 'password' | 'app-password';
  smtpConfig: {
    host: string;
    port: number;
    secure: boolean;
    tls?: boolean;
  };
  imapConfig: {
    host: string;
    port: number;
    secure: boolean;
  };
  popConfig?: {
    host: string;
    port: number;
    secure: boolean;
  };
  oauthConfig?: {
    clientId?: string;
    clientSecret?: string;
    redirectUri?: string;
    scopes: string[];
    authUrl: string;
    tokenUrl: string;
  };
}

export interface EmailAccount {
  id: string;
  providerId: string;
  email: string;
  displayName: string;
  isActive: boolean;
  authType: 'oauth' | 'password' | 'app-password';
  credentials: {
    accessToken?: string;
    refreshToken?: string;
    password?: string;
    appPassword?: string;
    expiresAt?: string;
  };
  settings: {
    signature?: string;
    autoReply?: boolean;
    syncFrequency: 'real-time' | 'every-5-min' | 'every-15-min' | 'hourly' | 'daily';
    maxEmails?: number;
  };
  lastSync?: string;
  status: 'connected' | 'disconnected' | 'error' | 'expired';
  lastError?: string;
  dateAdded: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  variables: string[];
  category: 'transactional' | 'marketing' | 'system';
  isActive: boolean;
  dateCreated: string;
  lastModified: string;
}

export interface EmailMessage {
  id: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  htmlBody?: string;
  textBody?: string;
  attachments?: EmailAttachment[];
  templateId?: string;
  variables?: Record<string, string>;
  status: 'draft' | 'sending' | 'sent' | 'failed' | 'bounced';
  sentAt?: string;
  error?: string;
  providerId: string;
  accountId: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  data: string; // base64 encoded
}

export interface EmailStats {
  totalSent: number;
  totalDelivered: number;
  totalBounced: number;
  totalOpened: number;
  totalClicked: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

class EmailServiceClass {
  private providers: EmailProvider[] = [];
  private accounts: EmailAccount[] = [];
  private templates: EmailTemplate[] = [];
  private messages: EmailMessage[] = [];
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeProviders();
    this.loadConfiguration();
  }

  private initializeProviders() {
    this.providers = [
      {
        id: 'gmail',
        name: 'Gmail',
        displayName: 'Google Gmail',
        icon: '📧',
        authType: 'oauth',
        smtpConfig: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          tls: true
        },
        imapConfig: {
          host: 'imap.gmail.com',
          port: 993,
          secure: true
        },
        popConfig: {
          host: 'pop.gmail.com',
          port: 995,
          secure: true
        },
        oauthConfig: {
          scopes: ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'],
          authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
          tokenUrl: 'https://oauth2.googleapis.com/token'
        }
      },
      {
        id: 'outlook',
        name: 'Outlook',
        displayName: 'Microsoft Outlook',
        icon: '📮',
        authType: 'oauth',
        smtpConfig: {
          host: 'smtp-mail.outlook.com',
          port: 587,
          secure: false,
          tls: true
        },
        imapConfig: {
          host: 'outlook.office365.com',
          port: 993,
          secure: true
        },
        oauthConfig: {
          scopes: ['https://graph.microsoft.com/Mail.Send', 'https://graph.microsoft.com/Mail.Read'],
          authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
          tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
        }
      },
      {
        id: 'hotmail',
        name: 'Hotmail',
        displayName: 'Microsoft Hotmail/Live',
        icon: '📫',
        authType: 'password',
        smtpConfig: {
          host: 'smtp.live.com',
          port: 587,
          secure: false,
          tls: true
        },
        imapConfig: {
          host: 'imap-mail.outlook.com',
          port: 993,
          secure: true
        },
        popConfig: {
          host: 'pop3.live.com',
          port: 995,
          secure: true
        }
      },
      {
        id: 'yahoo',
        name: 'Yahoo',
        displayName: 'Yahoo Mail',
        icon: '📬',
        authType: 'app-password',
        smtpConfig: {
          host: 'smtp.mail.yahoo.com',
          port: 587,
          secure: false,
          tls: true
        },
        imapConfig: {
          host: 'imap.mail.yahoo.com',
          port: 993,
          secure: true
        },
        popConfig: {
          host: 'pop.mail.yahoo.com',
          port: 995,
          secure: true
        }
      },
      {
        id: 'custom-smtp',
        name: 'Custom SMTP',
        displayName: 'Custom SMTP Server',
        icon: '⚙️',
        authType: 'password',
        smtpConfig: {
          host: '',
          port: 587,
          secure: false,
          tls: true
        },
        imapConfig: {
          host: '',
          port: 993,
          secure: true
        }
      }
    ];
  }

  // Provider Management
  getProviders(): EmailProvider[] {
    return this.providers;
  }

  getProvider(id: string): EmailProvider | undefined {
    return this.providers.find(p => p.id === id);
  }

  // Account Management
  async addAccount(
    providerId: string,
    email: string,
    credentials: EmailAccount['credentials'],
    settings: Partial<EmailAccount['settings']> = {}
  ): Promise<EmailAccount> {
    const provider = this.getProvider(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    const account: EmailAccount = {
      id: `account_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      providerId,
      email,
      displayName: email,
      isActive: true,
      authType: provider.authType,
      credentials,
      settings: {
        syncFrequency: 'hourly',
        maxEmails: 1000,
        autoReply: false,
        ...settings
      },
      status: 'connected',
      dateAdded: new Date().toISOString()
    };

    // Test connection before adding
    const testResult = await this.testConnection(account);
    if (!testResult.success) {
      throw new Error(`Connection test failed: ${testResult.error}`);
    }

    this.accounts.push(account);
    this.saveConfiguration();
    this.emit('account_added', account);

    return account;
  }

  getAccounts(): EmailAccount[] {
    return this.accounts;
  }

  getAccount(id: string): EmailAccount | undefined {
    return this.accounts.find(a => a.id === id);
  }

  async updateAccount(id: string, updates: Partial<EmailAccount>): Promise<EmailAccount> {
    const accountIndex = this.accounts.findIndex(a => a.id === id);
    if (accountIndex === -1) {
      throw new Error(`Account ${id} not found`);
    }

    this.accounts[accountIndex] = { ...this.accounts[accountIndex], ...updates };
    this.saveConfiguration();
    this.emit('account_updated', this.accounts[accountIndex]);

    return this.accounts[accountIndex];
  }

  async deleteAccount(id: string): Promise<void> {
    const accountIndex = this.accounts.findIndex(a => a.id === id);
    if (accountIndex === -1) {
      throw new Error(`Account ${id} not found`);
    }

    const account = this.accounts[accountIndex];
    this.accounts.splice(accountIndex, 1);
    this.saveConfiguration();
    this.emit('account_deleted', account);
  }

  // Connection Testing
  async testConnection(account: EmailAccount): Promise<{ success: boolean; error?: string }> {
    try {
      const provider = this.getProvider(account.providerId);
      if (!provider) {
        return { success: false, error: 'Provider not found' };
      }

      // In a real implementation, this would test the actual SMTP/IMAP connection
      // For now, we'll simulate the test
      if (account.authType === 'oauth' && !account.credentials.accessToken) {
        return { success: false, error: 'OAuth access token required' };
      }

      if (account.authType === 'password' && !account.credentials.password) {
        return { success: false, error: 'Password required' };
      }

      if (account.authType === 'app-password' && !account.credentials.appPassword) {
        return { success: false, error: 'App password required' };
      }

      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update account status
      await this.updateAccount(account.id, { 
        status: 'connected', 
        lastSync: new Date().toISOString(),
        lastError: undefined 
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.updateAccount(account.id, { 
        status: 'error', 
        lastError: errorMessage 
      });
      return { success: false, error: errorMessage };
    }
  }

  // Email Sending
  async sendEmail(message: Omit<EmailMessage, 'id' | 'status' | 'sentAt'>): Promise<EmailMessage> {
    const account = this.getAccount(message.accountId);
    if (!account) {
      throw new Error(`Account ${message.accountId} not found`);
    }

    if (!account.isActive || account.status !== 'connected') {
      throw new Error(`Account ${account.email} is not connected or active`);
    }

    const emailMessage: EmailMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'sending'
    };

    this.messages.push(emailMessage);
    this.emit('email_sending', emailMessage);

    try {
      // In a real implementation, this would use the provider's API or SMTP
      // For now, we'll simulate sending
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Apply template if specified
      if (message.templateId) {
        const template = this.getTemplate(message.templateId);
        if (template) {
          emailMessage.subject = this.applyVariables(template.subject, message.variables || {});
          emailMessage.htmlBody = this.applyVariables(template.htmlBody, message.variables || {});
          emailMessage.textBody = this.applyVariables(template.textBody, message.variables || {});
        }
      }

      // Update message status
      emailMessage.status = 'sent';
      emailMessage.sentAt = new Date().toISOString();
      
      this.emit('email_sent', emailMessage);
      return emailMessage;
    } catch (error) {
      emailMessage.status = 'failed';
      emailMessage.error = error instanceof Error ? error.message : 'Unknown error';
      this.emit('email_failed', emailMessage);
      throw error;
    }
  }

  // Template Management
  createTemplate(template: Omit<EmailTemplate, 'id' | 'dateCreated' | 'lastModified'>): EmailTemplate {
    const newTemplate: EmailTemplate = {
      ...template,
      id: `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dateCreated: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    this.templates.push(newTemplate);
    this.saveConfiguration();
    this.emit('template_created', newTemplate);

    return newTemplate;
  }

  getTemplates(): EmailTemplate[] {
    return this.templates;
  }

  getTemplate(id: string): EmailTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  updateTemplate(id: string, updates: Partial<EmailTemplate>): EmailTemplate {
    const templateIndex = this.templates.findIndex(t => t.id === id);
    if (templateIndex === -1) {
      throw new Error(`Template ${id} not found`);
    }

    this.templates[templateIndex] = {
      ...this.templates[templateIndex],
      ...updates,
      lastModified: new Date().toISOString()
    };

    this.saveConfiguration();
    this.emit('template_updated', this.templates[templateIndex]);

    return this.templates[templateIndex];
  }

  deleteTemplate(id: string): void {
    const templateIndex = this.templates.findIndex(t => t.id === id);
    if (templateIndex === -1) {
      throw new Error(`Template ${id} not found`);
    }

    const template = this.templates[templateIndex];
    this.templates.splice(templateIndex, 1);
    this.saveConfiguration();
    this.emit('template_deleted', template);
  }

  // Utility Methods
  private applyVariables(text: string, variables: Record<string, string>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => variables[key] || match);
  }

  // Statistics
  getEmailStats(accountId?: string): EmailStats {
    const messages = accountId ? 
      this.messages.filter(m => m.accountId === accountId) : 
      this.messages;

    const totalSent = messages.filter(m => m.status === 'sent').length;
    const totalFailed = messages.filter(m => m.status === 'failed').length;
    const totalBounced = messages.filter(m => m.status === 'bounced').length;

    return {
      totalSent,
      totalDelivered: totalSent, // In real implementation, this would be different
      totalBounced,
      totalOpened: Math.floor(totalSent * 0.25), // Mock data
      totalClicked: Math.floor(totalSent * 0.05), // Mock data
      deliveryRate: totalSent > 0 ? (totalSent / (totalSent + totalFailed)) * 100 : 0,
      openRate: totalSent > 0 ? 25 : 0, // Mock data
      clickRate: totalSent > 0 ? 5 : 0, // Mock data
      bounceRate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0
    };
  }

  // OAuth Helpers (for frontend OAuth flows)
  getOAuthUrl(providerId: string, clientId: string, redirectUri: string): string {
    const provider = this.getProvider(providerId);
    if (!provider?.oauthConfig) {
      throw new Error(`OAuth not supported for provider ${providerId}`);
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: provider.oauthConfig.scopes.join(' '),
      access_type: 'offline'
    });

    return `${provider.oauthConfig.authUrl}?${params.toString()}`;
  }

  // Event System
  on(event: string, handler: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(handler);
  }

  off(event: string, handler: Function): void {
    const handlers = this.eventListeners.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventListeners.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  // Persistence
  private loadConfiguration(): void {
    try {
      const accountsData = localStorage.getItem('email_accounts');
      if (accountsData) {
        this.accounts = JSON.parse(accountsData);
      }

      const templatesData = localStorage.getItem('email_templates');
      if (templatesData) {
        this.templates = JSON.parse(templatesData);
      }

      const messagesData = localStorage.getItem('email_messages');
      if (messagesData) {
        this.messages = JSON.parse(messagesData);
      }
    } catch (error) {
      console.error('Failed to load email configuration:', error);
    }
  }

  private saveConfiguration(): void {
    try {
      localStorage.setItem('email_accounts', JSON.stringify(this.accounts));
      localStorage.setItem('email_templates', JSON.stringify(this.templates));
      localStorage.setItem('email_messages', JSON.stringify(this.messages));
    } catch (error) {
      console.error('Failed to save email configuration:', error);
    }
  }

  // Built-in Templates
  initializeDefaultTemplates(): void {
    if (this.templates.length === 0) {
      const defaultTemplates = [
        {
          name: 'Password Reset',
          subject: 'Reset Your Password - {{appName}}',
          htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Password Reset Request</h2>
              <p>Hello {{userName}},</p>
              <p>You have requested to reset your password. Your temporary password is:</p>
              <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; font-family: monospace; font-size: 18px; font-weight: bold; text-align: center;">
                {{tempPassword}}
              </div>
              <p>Please log in using this temporary password and change it immediately for security reasons.</p>
              <p>If you did not request this password reset, please contact our support team.</p>
              <p>Best regards,<br>{{appName}} Team</p>
            </div>
          `,
          textBody: `Hello {{userName}},

You have requested to reset your password. Your temporary password is: {{tempPassword}}

Please log in using this temporary password and change it immediately for security reasons.

If you did not request this password reset, please contact our support team.

Best regards,
{{appName}} Team`,
          variables: ['userName', 'tempPassword', 'appName'],
          category: 'transactional' as const,
          isActive: true
        },
        {
          name: 'Welcome Email',
          subject: 'Welcome to {{appName}}!',
          htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Welcome to {{appName}}!</h2>
              <p>Hello {{userName}},</p>
              <p>Thank you for joining {{appName}}. We're excited to have you on board!</p>
              <p>Your account has been successfully created with the email: {{userEmail}}</p>
              <p>To get started, please log in to your account and explore our features.</p>
              <p>If you have any questions, don't hesitate to contact our support team.</p>
              <p>Best regards,<br>{{appName}} Team</p>
            </div>
          `,
          textBody: `Hello {{userName}},

Thank you for joining {{appName}}. We're excited to have you on board!

Your account has been successfully created with the email: {{userEmail}}

To get started, please log in to your account and explore our features.

If you have any questions, don't hesitate to contact our support team.

Best regards,
{{appName}} Team`,
          variables: ['userName', 'userEmail', 'appName'],
          category: 'transactional' as const,
          isActive: true
        }
      ];

      defaultTemplates.forEach(template => this.createTemplate(template));
    }
  }
}

// Export singleton instance
export const EmailService = new EmailServiceClass();

// Initialize default templates
EmailService.initializeDefaultTemplates();
