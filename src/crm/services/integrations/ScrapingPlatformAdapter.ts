/**
 * Scraping Platform Adapter
 * Handles automated posting for platforms without APIs like Craigslist
 */

import {
  BasePlatformAdapter,
  AuthenticationResult,
  ListingPublishResult,
  ListingUpdateResult,
  ListingRemovalResult,
  PlatformConnectionStatus
} from './BasePlatformAdapter';
import {
  RealEstatePlatform,
  PlatformAuthConfig,
  PropertyListingData,
  PlatformAnalytics
} from '../../types/RealEstatePlatformTypes';

export abstract class ScrapingPlatformAdapter extends BasePlatformAdapter {
  protected loginUrl: string;
  protected postUrl: string;
  protected manageUrl: string;
  protected sessionCookies: string = '';
  protected csrfToken: string = '';

  constructor(
    platform: RealEstatePlatform,
    baseUrl: string,
    loginUrl: string,
    postUrl: string,
    manageUrl: string
  ) {
    super(platform, baseUrl);
    this.loginUrl = loginUrl;
    this.postUrl = postUrl;
    this.manageUrl = manageUrl;
  }

  /**
   * Initialize with username/password authentication
   */
  async initialize(authConfig: PlatformAuthConfig): Promise<AuthenticationResult> {
    this.authConfig = authConfig;
    this.isProduction = authConfig.environment === 'production';

    if (!authConfig.username || !authConfig.password) {
      return {
        success: false,
        error: 'Username and password are required for this platform'
      };
    }

    // Attempt to login
    return await this.authenticate();
  }

  /**
   * Authenticate with username/password
   */
  async authenticate(): Promise<AuthenticationResult> {
    try {
      if (!this.authConfig?.username || !this.authConfig?.password) {
        return { success: false, error: 'Username and password not configured' };
      }

      // Get login page to extract CSRF token and session cookies
      const loginPageResponse = await fetch(this.loginUrl);
      const loginPageHtml = await loginPageResponse.text();
      
      // Extract session cookies
      const setCookieHeaders = loginPageResponse.headers.get('set-cookie');
      if (setCookieHeaders) {
        this.sessionCookies = setCookieHeaders;
      }

      // Extract CSRF token (implementation varies by platform)
      this.csrfToken = this.extractCsrfToken(loginPageHtml);

      // Perform login
      const loginData = this.buildLoginData();
      const loginResponse = await fetch(this.loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': this.sessionCookies,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: new URLSearchParams(loginData)
      });

      // Update session cookies after login
      const newCookies = loginResponse.headers.get('set-cookie');
      if (newCookies) {
        this.sessionCookies = newCookies;
      }

      // Check if login was successful
      const loginResponseText = await loginResponse.text();
      const loginSuccess = this.checkLoginSuccess(loginResponseText);

      if (loginSuccess) {
        return {
          success: true,
          message: 'Successfully authenticated with platform'
        };
      } else {
        return {
          success: false,
          error: 'Login failed - invalid credentials or security check required'
        };
      }

    } catch (error) {
      return {
        success: false,
        error: `Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Test connection by checking if we can access the posting page
   */
  async testConnection(): Promise<PlatformConnectionStatus> {
    try {
      if (!this.sessionCookies) {
        return {
          isConnected: false,
          lastChecked: new Date().toISOString(),
          connectionHealth: 'error',
          error: 'Not authenticated'
        };
      }

      const response = await fetch(this.postUrl, {
        headers: {
          'Cookie': this.sessionCookies,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const isConnected = response.ok && !response.url.includes('login');

      return {
        isConnected,
        lastChecked: new Date().toISOString(),
        connectionHealth: isConnected ? 'healthy' : 'error',
        error: isConnected ? undefined : 'Session expired or authentication required'
      };

    } catch (error) {
      return {
        isConnected: false,
        lastChecked: new Date().toISOString(),
        connectionHealth: 'error',
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  /**
   * Refresh authentication (re-login)
   */
  async refreshAuthentication(): Promise<AuthenticationResult> {
    return await this.authenticate();
  }

  /**
   * Get rate limit info (typically not available for scraping)
   */
  async getRateLimitInfo(): Promise<{ limit: number; remaining: number; resetTime: string }> {
    // Most platforms without APIs have posting limits but don't expose them
    return {
      limit: 10, // Conservative estimate
      remaining: 10,
      resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };
  }

  // Abstract methods for platform-specific implementation
  protected abstract extractCsrfToken(html: string): string;
  protected abstract buildLoginData(): Record<string, string>;
  protected abstract checkLoginSuccess(html: string): boolean;
  protected abstract buildPostData(listingData: PropertyListingData): FormData | Record<string, string>;

  // Common scraping utilities
  protected extractTextBetween(html: string, start: string, end: string): string {
    const startIndex = html.indexOf(start);
    if (startIndex === -1) return '';
    
    const extractStart = startIndex + start.length;
    const endIndex = html.indexOf(end, extractStart);
    if (endIndex === -1) return '';
    
    return html.substring(extractStart, endIndex).trim();
  }

  protected extractAttribute(html: string, tag: string, attribute: string): string {
    const regex = new RegExp(`<${tag}[^>]*${attribute}=["']([^"']*)["']`, 'i');
    const match = html.match(regex);
    return match ? match[1] : '';
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Abstract methods to be implemented by specific platform adapters
  abstract publishListing(listingData: PropertyListingData): Promise<ListingPublishResult>;
  abstract updateListing(externalListingId: string, listingData: Partial<PropertyListingData>): Promise<ListingUpdateResult>;
  abstract removeListing(externalListingId: string): Promise<ListingRemovalResult>;
  abstract getListingStatus(externalListingId: string): Promise<any>;
  abstract getAnalytics(startDate: string, endDate: string): Promise<PlatformAnalytics>;
  abstract transformPropertyData(crmData: any): PropertyListingData;
  abstract getValidationRules(): any;
  abstract validateListingData(listingData: PropertyListingData): { valid: boolean; errors: string[] };
  abstract handleWebhook(payload: any): Promise<{ processed: boolean; action?: string }>;
}

/**
 * Craigslist Platform Adapter
 */
export class CraigslistAdapter extends ScrapingPlatformAdapter {
  private selectedCity: string = 'atlanta'; // Default city

  constructor(city: string = 'atlanta') {
    super(
      'craigslist',
      `https://${city}.craigslist.org`,
      `https://accounts.craigslist.org/login`,
      `https://${city}.craigslist.org/housingpost`,
      `https://accounts.craigslist.org/manage`
    );
    this.selectedCity = city;
  }

  protected extractCsrfToken(html: string): string {
    // Craigslist CSRF token is typically in a meta tag or hidden input
    return this.extractAttribute(html, 'input', 'value') ||
           this.extractAttribute(html, 'meta', 'content');
  }

  protected buildLoginData(): Record<string, string> {
    return {
      inputEmailHandle: this.authConfig!.username!,
      inputPassword: this.authConfig!.password!,
      go: 'Log In'
    };
  }

  protected checkLoginSuccess(html: string): boolean {
    // Check for common success indicators
    return !html.includes('invalid login') && 
           !html.includes('error') && 
           (html.includes('account') || html.includes('manage'));
  }

  protected buildPostData(listingData: PropertyListingData): Record<string, string> {
    const address = this.parseAddress(listingData.address);
    
    return {
      'category': 'apa', // Apartments for rent
      'area': this.mapToArea(address.city),
      'PostingTitle': listingData.title,
      'PostingBody': this.buildDescription(listingData),
      'Rent': listingData.price.toString(),
      'Bedrooms': listingData.bedrooms.toString(),
      'Bathrooms': listingData.bathrooms?.toString() || '1',
      'SquareFeet': listingData.squareFootage?.toString() || '',
      'street_address': address.street,
      'city': address.city,
      'postal_code': address.zipCode,
      'contact_name': listingData.contactInfo?.name || '',
      'contact_phone': listingData.contactInfo?.phone || '',
      'contact_email': listingData.contactInfo?.email || '',
      'available_date': listingData.availableDate || ''
    };
  }

  async publishListing(listingData: PropertyListingData): Promise<ListingPublishResult> {
    try {
      // Ensure we're authenticated
      const connectionStatus = await this.testConnection();
      if (!connectionStatus.isConnected) {
        const authResult = await this.authenticate();
        if (!authResult.success) {
          throw new Error('Authentication failed');
        }
      }

      // Get posting form
      const postPageResponse = await fetch(this.postUrl, {
        headers: {
          'Cookie': this.sessionCookies,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const postPageHtml = await postPageResponse.text();
      
      // Build form data
      const formData = this.buildPostData(listingData);
      
      // Add CSRF token
      const csrfToken = this.extractCsrfToken(postPageHtml);
      if (csrfToken) {
        formData['token'] = csrfToken;
      }

      // Submit listing
      const submitResponse = await fetch(this.postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': this.sessionCookies,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: new URLSearchParams(formData)
      });

      const responseHtml = await submitResponse.text();

      // Check if posting was successful
      if (responseHtml.includes('posting has been created') || 
          responseHtml.includes('thank you') ||
          submitResponse.url.includes('manage')) {
        
        // Extract posting ID from response
        const postingId = this.extractPostingId(responseHtml);
        
        return {
          success: true,
          externalListingId: postingId,
          listingUrl: `https://${this.selectedCity}.craigslist.org/apa/${postingId}.html`,
          message: 'Listing posted successfully to Craigslist'
        };
      } else {
        throw new Error('Posting failed - form validation error or security check');
      }

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to post to Craigslist'
      };
    }
  }

  async updateListing(externalListingId: string, listingData: Partial<PropertyListingData>): Promise<ListingUpdateResult> {
    // Craigslist doesn't support listing updates - need to delete and repost
    return {
      success: false,
      error: 'Craigslist does not support listing updates. Please delete and repost.'
    };
  }

  async removeListing(externalListingId: string): Promise<ListingRemovalResult> {
    try {
      // Navigate to manage page
      const manageResponse = await fetch(this.manageUrl, {
        headers: {
          'Cookie': this.sessionCookies,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const manageHtml = await manageResponse.text();
      
      // Find delete link for the specific listing
      const deleteUrl = this.findDeleteUrl(manageHtml, externalListingId);
      
      if (!deleteUrl) {
        throw new Error('Listing not found in account');
      }

      // Execute delete
      await fetch(deleteUrl, {
        headers: {
          'Cookie': this.sessionCookies,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      return { success: true, message: 'Listing removed successfully' };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove listing'
      };
    }
  }

  async getListingStatus(externalListingId: string): Promise<any> {
    try {
      const listingUrl = `https://${this.selectedCity}.craigslist.org/apa/${externalListingId}.html`;
      const response = await fetch(listingUrl);
      
      return {
        id: externalListingId,
        status: response.ok ? 'active' : 'inactive',
        url: listingUrl,
        lastChecked: new Date().toISOString()
      };

    } catch (error) {
      throw new Error(`Failed to check listing status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAnalytics(startDate: string, endDate: string): Promise<PlatformAnalytics> {
    // Craigslist doesn't provide analytics - return mock data
    return {
      platform: 'craigslist',
      period: 'custom',
      startDate,
      endDate,
      metrics: {
        totalListings: 0,
        activeListings: 0,
        successfulPublications: 0,
        failedPublications: 0,
        totalViews: 0,
        totalInquiries: 0,
        conversionRate: 0,
        averageTimeToPublish: 0,
        revenue: 0,
        costs: 0,
        profit: 0
      },
      topPerformingListings: []
    };
  }

  transformPropertyData(crmData: any): PropertyListingData {
    return {
      propertyId: crmData.id,
      title: crmData.name || 'Rental Property',
      description: this.sanitizeText(crmData.description || '', 500),
      price: crmData.monthlyRent || crmData.price || 0,
      address: crmData.address || '',
      bedrooms: crmData.bedrooms || 1,
      bathrooms: crmData.bathrooms || 1,
      squareFootage: crmData.squareFootage || 0,
      propertyType: crmData.type || 'apartment',
      amenities: crmData.amenities || [],
      photos: (crmData.photos || []).slice(0, 8), // Craigslist limit
      contactInfo: {
        name: crmData.contactName || 'Property Owner',
        email: crmData.contactEmail || '',
        phone: crmData.contactPhone || ''
      },
      availableDate: crmData.availableDate || new Date().toISOString().split('T')[0]
    };
  }

  getValidationRules(): any {
    return {
      required: ['title', 'price', 'address'],
      maxPhotos: 8,
      maxDescriptionLength: 500,
      propertyTypes: ['apartment', 'house', 'room', 'sublet'],
      priceRange: { min: 1, max: 10000 }
    };
  }

  validateListingData(listingData: PropertyListingData): { valid: boolean; errors: string[] } {
    const rules = this.getValidationRules();
    const errors: string[] = [];

    errors.push(...this.validateRequiredFields(listingData, rules.required));
    errors.push(...this.validateNumericField(listingData.price, 'price', rules.priceRange.min, rules.priceRange.max));

    if (listingData.photos && listingData.photos.length > rules.maxPhotos) {
      errors.push(`Maximum ${rules.maxPhotos} photos allowed`);
    }

    return { valid: errors.length === 0, errors };
  }

  async handleWebhook(payload: any): Promise<{ processed: boolean; action?: string }> {
    // Craigslist doesn't support webhooks
    return { processed: false };
  }

  // Private helper methods
  private mapToArea(city: string): string {
    // Map city names to Craigslist area codes
    const areaMap: Record<string, string> = {
      'atlanta': 'atl',
      'decatur': 'atl',
      'marietta': 'atl',
      'roswell': 'atl'
    };

    return areaMap[city.toLowerCase()] || 'atl';
  }

  private buildDescription(listingData: PropertyListingData): string {
    let description = listingData.description || '';
    
    if (listingData.amenities?.length) {
      description += '\n\nAmenities:\n' + listingData.amenities.join(', ');
    }

    if (listingData.squareFootage) {
      description += `\n\nSquare Footage: ${listingData.squareFootage} sq ft`;
    }

    if (listingData.availableDate) {
      description += `\n\nAvailable: ${listingData.availableDate}`;
    }

    return this.sanitizeText(description, 500);
  }

  private extractPostingId(html: string): string {
    // Extract posting ID from Craigslist response
    const idMatch = html.match(/posting ID: (\d+)/i);
    if (idMatch) return idMatch[1];

    // Alternative extraction methods
    const urlMatch = html.match(/\/(\d+)\.html/);
    if (urlMatch) return urlMatch[1];

    // Generate random ID if extraction fails
    return Date.now().toString();
  }

  private findDeleteUrl(html: string, postingId: string): string | null {
    // Find delete URL for specific posting in manage page
    const lines = html.split('\n');
    for (const line of lines) {
      if (line.includes(postingId) && line.includes('delete')) {
        const urlMatch = line.match(/href="([^"]*delete[^"]*)"/);
        if (urlMatch) return urlMatch[1];
      }
    }
    return null;
  }
}
