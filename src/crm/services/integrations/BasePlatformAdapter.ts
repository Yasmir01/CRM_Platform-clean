/**
 * Base Platform Adapter Interface
 * Defines the common interface for all real estate platform integrations
 */

import {
  RealEstatePlatform,
  PlatformAuthConfig,
  PropertyListingData,
  PublishingResult,
  PlatformAnalytics
} from '../../types/RealEstatePlatformTypes';

export interface AuthenticationResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: string;
  message?: string;
}

export interface ListingPublishResult {
  success: boolean;
  externalListingId?: string;
  listingUrl?: string;
  error?: string;
  message?: string;
  platformResponse?: any;
}

export interface ListingUpdateResult {
  success: boolean;
  error?: string;
  message?: string;
}

export interface ListingRemovalResult {
  success: boolean;
  error?: string;
  message?: string;
}

export interface PlatformConnectionStatus {
  isConnected: boolean;
  lastChecked: string;
  connectionHealth: 'healthy' | 'warning' | 'error';
  error?: string;
  tokensValid?: boolean;
  apiLimitRemaining?: number;
}

export abstract class BasePlatformAdapter {
  protected platform: RealEstatePlatform;
  protected authConfig: PlatformAuthConfig | null = null;
  protected baseUrl: string;
  protected isProduction: boolean = false;

  constructor(platform: RealEstatePlatform, baseUrl: string) {
    this.platform = platform;
    this.baseUrl = baseUrl;
  }

  /**
   * Initialize the adapter with authentication configuration
   */
  abstract initialize(authConfig: PlatformAuthConfig): Promise<AuthenticationResult>;

  /**
   * Test the connection to the platform
   */
  abstract testConnection(): Promise<PlatformConnectionStatus>;

  /**
   * Authenticate with the platform
   */
  abstract authenticate(): Promise<AuthenticationResult>;

  /**
   * Refresh authentication tokens if needed
   */
  abstract refreshAuthentication(): Promise<AuthenticationResult>;

  /**
   * Publish a property listing to the platform
   */
  abstract publishListing(listingData: PropertyListingData): Promise<ListingPublishResult>;

  /**
   * Update an existing listing on the platform
   */
  abstract updateListing(
    externalListingId: string, 
    listingData: Partial<PropertyListingData>
  ): Promise<ListingUpdateResult>;

  /**
   * Remove a listing from the platform
   */
  abstract removeListing(externalListingId: string): Promise<ListingRemovalResult>;

  /**
   * Get listing status from the platform
   */
  abstract getListingStatus(externalListingId: string): Promise<any>;

  /**
   * Get platform-specific analytics
   */
  abstract getAnalytics(startDate: string, endDate: string): Promise<PlatformAnalytics>;

  /**
   * Transform CRM property data to platform-specific format
   */
  abstract transformPropertyData(crmData: any): PropertyListingData;

  /**
   * Get platform-specific validation rules
   */
  abstract getValidationRules(): any;

  /**
   * Validate listing data against platform requirements
   */
  abstract validateListingData(listingData: PropertyListingData): { valid: boolean; errors: string[] };

  /**
   * Get platform rate limits and usage
   */
  abstract getRateLimitInfo(): Promise<{ limit: number; remaining: number; resetTime: string }>;

  /**
   * Handle platform-specific webhooks
   */
  abstract handleWebhook(payload: any): Promise<{ processed: boolean; action?: string }>;

  // Common utility methods
  protected async makeApiRequest(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    data?: any,
    headers?: Record<string, string>
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'CRM-RealEstate-Integration/1.0',
      ...headers
    };

    try {
      const response = await fetch(url, {
        method,
        headers: defaultHeaders,
        body: data ? JSON.stringify(data) : undefined
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${this.platform}:`, error);
      throw error;
    }
  }

  protected getAuthHeaders(): Record<string, string> {
    if (!this.authConfig) {
      throw new Error('Authentication not configured');
    }

    const headers: Record<string, string> = {};

    if (this.authConfig.accessToken) {
      headers['Authorization'] = `Bearer ${this.authConfig.accessToken}`;
    } else if (this.authConfig.apiKey) {
      headers['X-API-Key'] = this.authConfig.apiKey;
    }

    return headers;
  }

  protected isTokenExpired(): boolean {
    if (!this.authConfig?.tokenExpiresAt) return false;
    return new Date() >= new Date(this.authConfig.tokenExpiresAt);
  }

  protected async ensureAuthenticated(): Promise<void> {
    if (!this.authConfig) {
      throw new Error('Authentication not configured');
    }

    if (this.isTokenExpired()) {
      const result = await this.refreshAuthentication();
      if (!result.success) {
        throw new Error(`Authentication refresh failed: ${result.error}`);
      }
    }
  }

  // Common data validation
  protected validateRequiredFields(data: any, requiredFields: string[]): string[] {
    const errors: string[] = [];
    
    for (const field of requiredFields) {
      if (!data[field] || data[field] === '') {
        errors.push(`Required field '${field}' is missing or empty`);
      }
    }

    return errors;
  }

  protected validateNumericField(value: any, fieldName: string, min?: number, max?: number): string[] {
    const errors: string[] = [];
    
    if (value !== null && value !== undefined) {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        errors.push(`${fieldName} must be a valid number`);
      } else {
        if (min !== undefined && numValue < min) {
          errors.push(`${fieldName} must be at least ${min}`);
        }
        if (max !== undefined && numValue > max) {
          errors.push(`${fieldName} must be no more than ${max}`);
        }
      }
    }

    return errors;
  }

  protected validateEmailField(email: string, fieldName: string): string[] {
    const errors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
      errors.push(`${fieldName} must be a valid email address`);
    }

    return errors;
  }

  protected validatePhoneField(phone: string, fieldName: string): string[] {
    const errors: string[] = [];
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    
    if (phone && !phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.push(`${fieldName} must be a valid phone number`);
    }

    return errors;
  }

  protected sanitizeText(text: string, maxLength?: number): string {
    if (!text) return '';
    
    let sanitized = text
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/\r\n/g, '\n') // Normalize line breaks
      .trim();

    if (maxLength && sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength - 3) + '...';
    }

    return sanitized;
  }

  protected formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  protected parseAddress(address: string): {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  } {
    // Basic address parsing - in production, use a proper address parsing service
    const parts = address.split(',').map(part => part.trim());
    
    return {
      street: parts[0] || '',
      city: parts[1] || '',
      state: parts[2] || '',
      zipCode: parts[3] || '',
      country: 'US' // Default to US
    };
  }
}
