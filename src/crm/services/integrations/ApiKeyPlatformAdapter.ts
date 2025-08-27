/**
 * API Key Platform Adapter
 * Handles API key authentication for platforms like Apartments.com, Zumper, etc.
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

export abstract class ApiKeyPlatformAdapter extends BasePlatformAdapter {
  protected apiVersion: string;

  constructor(platform: RealEstatePlatform, baseUrl: string, apiVersion: string = 'v1') {
    super(platform, baseUrl);
    this.apiVersion = apiVersion;
  }

  /**
   * Initialize with API key authentication
   */
  async initialize(authConfig: PlatformAuthConfig): Promise<AuthenticationResult> {
    this.authConfig = authConfig;
    this.isProduction = authConfig.environment === 'production';

    if (!authConfig.apiKey) {
      return {
        success: false,
        error: 'API Key is required for this platform'
      };
    }

    // Test the API key
    const status = await this.testConnection();
    
    return {
      success: status.isConnected,
      message: status.isConnected ? 'API Key validated successfully' : status.error
    };
  }

  /**
   * Authenticate with API key (immediate validation)
   */
  async authenticate(): Promise<AuthenticationResult> {
    if (!this.authConfig?.apiKey) {
      return { success: false, error: 'API Key not configured' };
    }

    const status = await this.testConnection();
    
    return {
      success: status.isConnected,
      message: status.isConnected ? 'API Key is valid' : status.error
    };
  }

  /**
   * API key doesn't require token refresh
   */
  async refreshAuthentication(): Promise<AuthenticationResult> {
    return { success: true, message: 'API Key authentication does not require refresh' };
  }

  /**
   * Test API key validity
   */
  async testConnection(): Promise<PlatformConnectionStatus> {
    try {
      if (!this.authConfig?.apiKey) {
        return {
          isConnected: false,
          lastChecked: new Date().toISOString(),
          connectionHealth: 'error',
          error: 'No API key configured'
        };
      }

      // Make a test API call
      const testEndpoint = this.getTestEndpoint();
      await this.makeApiRequest(testEndpoint, 'GET', undefined, this.getAuthHeaders());

      return {
        isConnected: true,
        lastChecked: new Date().toISOString(),
        connectionHealth: 'healthy',
        tokensValid: true
      };

    } catch (error) {
      return {
        isConnected: false,
        lastChecked: new Date().toISOString(),
        connectionHealth: 'error',
        error: error instanceof Error ? error.message : 'API key validation failed'
      };
    }
  }

  /**
   * Get authentication headers with API key
   */
  protected getAuthHeaders(): Record<string, string> {
    if (!this.authConfig?.apiKey) {
      throw new Error('API Key not configured');
    }

    const headers: Record<string, string> = {};

    // Different platforms use different header formats
    if (this.authConfig.apiSecret) {
      // Some platforms use API key + secret
      headers['X-API-Key'] = this.authConfig.apiKey;
      headers['X-API-Secret'] = this.authConfig.apiSecret;
    } else {
      // Most use just API key
      headers['X-API-Key'] = this.authConfig.apiKey;
    }

    return headers;
  }

  /**
   * Get rate limit information
   */
  async getRateLimitInfo(): Promise<{ limit: number; remaining: number; resetTime: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/rate-limit`, {
        headers: this.getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        return {
          limit: data.limit || 1000,
          remaining: data.remaining || 1000,
          resetTime: data.resetTime || new Date(Date.now() + 3600000).toISOString()
        };
      }

      // Check rate limit headers
      const limit = parseInt(response.headers.get('X-RateLimit-Limit') || '1000');
      const remaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '1000');
      const resetTime = response.headers.get('X-RateLimit-Reset') || 
                       new Date(Date.now() + 3600000).toISOString();

      return { limit, remaining, resetTime };

    } catch (error) {
      console.error('Failed to get rate limit info:', error);
      return {
        limit: 1000,
        remaining: 0,
        resetTime: new Date(Date.now() + 3600000).toISOString()
      };
    }
  }

  protected abstract getTestEndpoint(): string;

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
 * Apartments.com Platform Adapter
 */
export class ApartmentsComAdapter extends ApiKeyPlatformAdapter {
  constructor() {
    super('apartments_com', 'https://api.apartments.com/v2', 'v2');
  }

  protected getTestEndpoint(): string {
    return '/account/profile';
  }

  async publishListing(listingData: PropertyListingData): Promise<ListingPublishResult> {
    try {
      const apartmentsData = this.transformPropertyData(listingData);
      const response = await this.makeApiRequest(
        '/properties',
        'POST',
        apartmentsData,
        this.getAuthHeaders()
      );

      return {
        success: true,
        externalListingId: response.property_id,
        listingUrl: `https://www.apartments.com/property/${response.property_id}`,
        message: 'Listing published successfully to Apartments.com'
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to publish to Apartments.com'
      };
    }
  }

  async updateListing(externalListingId: string, listingData: Partial<PropertyListingData>): Promise<ListingUpdateResult> {
    try {
      const updateData = this.transformPropertyData(listingData);
      await this.makeApiRequest(
        `/properties/${externalListingId}`,
        'PUT',
        updateData,
        this.getAuthHeaders()
      );

      return { success: true, message: 'Listing updated successfully' };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update listing'
      };
    }
  }

  async removeListing(externalListingId: string): Promise<ListingRemovalResult> {
    try {
      await this.makeApiRequest(
        `/properties/${externalListingId}`,
        'DELETE',
        undefined,
        this.getAuthHeaders()
      );

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
      return await this.makeApiRequest(
        `/properties/${externalListingId}/status`,
        'GET',
        undefined,
        this.getAuthHeaders()
      );

    } catch (error) {
      throw new Error(`Failed to get listing status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAnalytics(startDate: string, endDate: string): Promise<PlatformAnalytics> {
    try {
      const response = await this.makeApiRequest(
        `/analytics?start_date=${startDate}&end_date=${endDate}`,
        'GET',
        undefined,
        this.getAuthHeaders()
      );

      return {
        platform: 'apartments_com',
        period: 'custom',
        startDate,
        endDate,
        metrics: {
          totalListings: response.total_properties || 0,
          activeListings: response.active_properties || 0,
          successfulPublications: response.successful_listings || 0,
          failedPublications: response.failed_listings || 0,
          totalViews: response.total_views || 0,
          totalInquiries: response.total_leads || 0,
          conversionRate: response.lead_conversion_rate || 0,
          averageTimeToPublish: response.avg_processing_time || 0,
          revenue: response.revenue || 0,
          costs: response.listing_fees || 0,
          profit: (response.revenue || 0) - (response.listing_fees || 0)
        },
        topPerformingListings: response.top_properties || []
      };

    } catch (error) {
      throw new Error(`Failed to get analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  transformPropertyData(crmData: any): PropertyListingData {
    return {
      propertyId: crmData.id,
      title: crmData.name || 'Apartment for Rent',
      description: this.sanitizeText(crmData.description || '', 2000),
      price: crmData.monthlyRent || crmData.price || 0,
      address: crmData.address || '',
      bedrooms: crmData.bedrooms || 0,
      bathrooms: crmData.bathrooms || 0,
      squareFootage: crmData.squareFootage || 0,
      propertyType: this.mapPropertyType(crmData.type),
      amenities: crmData.amenities || [],
      photos: (crmData.photos || []).slice(0, 25), // Apartments.com limit
      contactInfo: {
        name: crmData.contactName || 'Leasing Office',
        email: crmData.contactEmail || '',
        phone: crmData.contactPhone || ''
      },
      availableDate: crmData.availableDate || new Date().toISOString().split('T')[0],
      petPolicy: crmData.petPolicy || 'Contact for pet policy',
      utilities: crmData.utilities || 'Contact for utility information'
    };
  }

  private mapPropertyType(crmType: string): string {
    const typeMap: Record<string, string> = {
      'apartment': 'apartment',
      'house': 'house',
      'condo': 'condo',
      'townhome': 'townhouse',
      'studio': 'studio'
    };

    return typeMap[crmType?.toLowerCase()] || 'apartment';
  }

  getValidationRules(): any {
    return {
      required: ['title', 'price', 'address', 'bedrooms', 'bathrooms', 'squareFootage'],
      maxPhotos: 25,
      maxDescriptionLength: 2000,
      propertyTypes: ['apartment', 'condo', 'townhouse', 'studio'],
      priceRange: { min: 1, max: 25000 },
      squareFootageRange: { min: 100, max: 10000 }
    };
  }

  validateListingData(listingData: PropertyListingData): { valid: boolean; errors: string[] } {
    const rules = this.getValidationRules();
    const errors: string[] = [];

    // Check required fields
    errors.push(...this.validateRequiredFields(listingData, rules.required));

    // Check price range
    errors.push(...this.validateNumericField(listingData.price, 'price', rules.priceRange.min, rules.priceRange.max));

    // Check bedrooms/bathrooms
    errors.push(...this.validateNumericField(listingData.bedrooms, 'bedrooms', 0, 5));
    errors.push(...this.validateNumericField(listingData.bathrooms, 'bathrooms', 0, 5));

    // Check square footage
    errors.push(...this.validateNumericField(
      listingData.squareFootage, 
      'squareFootage', 
      rules.squareFootageRange.min, 
      rules.squareFootageRange.max
    ));

    // Check photos limit
    if (listingData.photos && listingData.photos.length > rules.maxPhotos) {
      errors.push(`Maximum ${rules.maxPhotos} photos allowed`);
    }

    // Check description length
    if (listingData.description && listingData.description.length > rules.maxDescriptionLength) {
      errors.push(`Description must be no more than ${rules.maxDescriptionLength} characters`);
    }

    // Validate contact info
    if (listingData.contactInfo?.email) {
      errors.push(...this.validateEmailField(listingData.contactInfo.email, 'contactEmail'));
    }

    if (listingData.contactInfo?.phone) {
      errors.push(...this.validatePhoneField(listingData.contactInfo.phone, 'contactPhone'));
    }

    return { valid: errors.length === 0, errors };
  }

  async handleWebhook(payload: any): Promise<{ processed: boolean; action?: string }> {
    try {
      // Handle Apartments.com webhook events
      switch (payload.event) {
        case 'property.published':
          return { processed: true, action: 'listing_published' };
        case 'property.updated':
          return { processed: true, action: 'listing_updated' };
        case 'property.deleted':
          return { processed: true, action: 'listing_removed' };
        case 'lead.received':
          return { processed: true, action: 'lead_received' };
        default:
          return { processed: false };
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
      return { processed: false };
    }
  }
}

/**
 * Zumper Platform Adapter
 */
export class ZumperAdapter extends ApiKeyPlatformAdapter {
  constructor() {
    super('zumper', 'https://api.zumper.com/v1', 'v1');
  }

  protected getTestEndpoint(): string {
    return '/user';
  }

  async publishListing(listingData: PropertyListingData): Promise<ListingPublishResult> {
    try {
      const zumperData = this.transformPropertyData(listingData);
      const response = await this.makeApiRequest(
        '/listings',
        'POST',
        zumperData,
        this.getAuthHeaders()
      );

      return {
        success: true,
        externalListingId: response.listing_id,
        listingUrl: `https://www.zumper.com/listing/${response.listing_id}`,
        message: 'Listing published successfully to Zumper'
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to publish to Zumper'
      };
    }
  }

  async updateListing(externalListingId: string, listingData: Partial<PropertyListingData>): Promise<ListingUpdateResult> {
    try {
      const updateData = this.transformPropertyData(listingData);
      await this.makeApiRequest(
        `/listings/${externalListingId}`,
        'PUT',
        updateData,
        this.getAuthHeaders()
      );

      return { success: true, message: 'Listing updated successfully' };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update listing'
      };
    }
  }

  async removeListing(externalListingId: string): Promise<ListingRemovalResult> {
    try {
      await this.makeApiRequest(
        `/listings/${externalListingId}`,
        'DELETE',
        undefined,
        this.getAuthHeaders()
      );

      return { success: true, message: 'Listing removed successfully' };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove listing'
      };
    }
  }

  async getListingStatus(externalListingId: string): Promise<any> {
    return await this.makeApiRequest(
      `/listings/${externalListingId}`,
      'GET',
      undefined,
      this.getAuthHeaders()
    );
  }

  async getAnalytics(startDate: string, endDate: string): Promise<PlatformAnalytics> {
    const response = await this.makeApiRequest(
      `/analytics?start=${startDate}&end=${endDate}`,
      'GET',
      undefined,
      this.getAuthHeaders()
    );

    return {
      platform: 'zumper',
      period: 'custom',
      startDate,
      endDate,
      metrics: {
        totalListings: response.total_listings || 0,
        activeListings: response.active_listings || 0,
        successfulPublications: response.published_listings || 0,
        failedPublications: response.failed_listings || 0,
        totalViews: response.total_views || 0,
        totalInquiries: response.total_inquiries || 0,
        conversionRate: response.inquiry_rate || 0,
        averageTimeToPublish: response.avg_publish_time || 0,
        revenue: response.revenue || 0,
        costs: response.costs || 0,
        profit: (response.revenue || 0) - (response.costs || 0)
      },
      topPerformingListings: response.top_listings || []
    };
  }

  transformPropertyData(crmData: any): PropertyListingData {
    return {
      propertyId: crmData.id,
      title: crmData.name || 'Rental Property',
      description: this.sanitizeText(crmData.description || '', 1000),
      price: crmData.monthlyRent || crmData.price || 0,
      address: crmData.address || '',
      bedrooms: crmData.bedrooms || 0,
      bathrooms: crmData.bathrooms || 0,
      squareFootage: crmData.squareFootage || 0,
      propertyType: crmData.type || 'apartment',
      amenities: crmData.amenities || [],
      photos: (crmData.photos || []).slice(0, 30),
      contactInfo: {
        name: crmData.contactName || 'Property Manager',
        email: crmData.contactEmail || '',
        phone: crmData.contactPhone || ''
      },
      availableDate: crmData.availableDate || new Date().toISOString().split('T')[0]
    };
  }

  getValidationRules(): any {
    return {
      required: ['title', 'price', 'address', 'bedrooms', 'bathrooms'],
      maxPhotos: 30,
      maxDescriptionLength: 1000,
      propertyTypes: ['apartment', 'condo', 'townhome'],
      priceRange: { min: 1, max: 20000 }
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
    try {
      switch (payload.type) {
        case 'listing.created':
          return { processed: true, action: 'listing_published' };
        case 'listing.updated':
          return { processed: true, action: 'listing_updated' };
        case 'listing.deleted':
          return { processed: true, action: 'listing_removed' };
        default:
          return { processed: false };
      }
    } catch (error) {
      return { processed: false };
    }
  }
}
