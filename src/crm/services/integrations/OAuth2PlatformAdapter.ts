/**
 * OAuth2 Platform Adapter
 * Handles OAuth2 authentication flow for platforms like Zillow, Trulia, Realtor.com
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

export abstract class OAuth2PlatformAdapter extends BasePlatformAdapter {
  protected authorizationUrl: string;
  protected tokenUrl: string;
  protected scopes: string[];

  constructor(
    platform: RealEstatePlatform,
    baseUrl: string,
    authorizationUrl: string,
    tokenUrl: string,
    scopes: string[] = []
  ) {
    super(platform, baseUrl);
    this.authorizationUrl = authorizationUrl;
    this.tokenUrl = tokenUrl;
    this.scopes = scopes;
  }

  /**
   * Initialize OAuth2 flow
   */
  async initialize(authConfig: PlatformAuthConfig): Promise<AuthenticationResult> {
    this.authConfig = authConfig;
    this.isProduction = authConfig.environment === 'production';

    if (!authConfig.clientId || !authConfig.clientSecret) {
      return {
        success: false,
        error: 'Client ID and Client Secret are required for OAuth2'
      };
    }

    // If we have existing tokens, validate them
    if (authConfig.accessToken) {
      const status = await this.testConnection();
      if (status.isConnected) {
        return { success: true, message: 'Already authenticated' };
      }
    }

    // Start OAuth2 flow
    return this.startOAuth2Flow();
  }

  /**
   * Start OAuth2 authorization flow
   */
  private startOAuth2Flow(): AuthenticationResult {
    if (!this.authConfig?.clientId || !this.authConfig?.redirectUri) {
      return {
        success: false,
        error: 'Client ID and Redirect URI are required'
      };
    }

    const authUrl = this.buildAuthorizationUrl();
    
    return {
      success: true,
      message: `Please visit the following URL to authorize the application: ${authUrl}`
    };
  }

  /**
   * Build OAuth2 authorization URL
   */
  private buildAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_id: this.authConfig!.clientId!,
      redirect_uri: this.authConfig!.redirectUri!,
      response_type: 'code',
      scope: this.scopes.join(' '),
      state: this.generateState()
    });

    return `${this.authorizationUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(authorizationCode: string, state?: string): Promise<AuthenticationResult> {
    if (!this.authConfig) {
      return { success: false, error: 'Authentication not configured' };
    }

    try {
      const tokenData = {
        grant_type: 'authorization_code',
        client_id: this.authConfig.clientId!,
        client_secret: this.authConfig.clientSecret!,
        code: authorizationCode,
        redirect_uri: this.authConfig.redirectUri!
      };

      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams(tokenData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        return {
          success: false,
          error: `Token exchange failed: ${response.status} ${errorData}`
        };
      }

      const tokens = await response.json();

      // Update auth config with tokens
      this.authConfig.accessToken = tokens.access_token;
      this.authConfig.refreshToken = tokens.refresh_token;
      this.authConfig.tokenExpiresAt = new Date(
        Date.now() + (tokens.expires_in * 1000)
      ).toISOString();

      return {
        success: true,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresIn: tokens.expires_in,
        message: 'Successfully authenticated with OAuth2'
      };

    } catch (error) {
      return {
        success: false,
        error: `OAuth2 token exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAuthentication(): Promise<AuthenticationResult> {
    if (!this.authConfig?.refreshToken) {
      return { success: false, error: 'No refresh token available' };
    }

    try {
      const tokenData = {
        grant_type: 'refresh_token',
        client_id: this.authConfig.clientId!,
        client_secret: this.authConfig.clientSecret!,
        refresh_token: this.authConfig.refreshToken
      };

      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams(tokenData)
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Token refresh failed: ${response.status}`
        };
      }

      const tokens = await response.json();

      // Update auth config with new tokens
      this.authConfig.accessToken = tokens.access_token;
      if (tokens.refresh_token) {
        this.authConfig.refreshToken = tokens.refresh_token;
      }
      this.authConfig.tokenExpiresAt = new Date(
        Date.now() + (tokens.expires_in * 1000)
      ).toISOString();

      return {
        success: true,
        accessToken: tokens.access_token,
        expiresIn: tokens.expires_in,
        message: 'Token refreshed successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: `Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Test connection to platform
   */
  async testConnection(): Promise<PlatformConnectionStatus> {
    try {
      if (!this.authConfig?.accessToken) {
        return {
          isConnected: false,
          lastChecked: new Date().toISOString(),
          connectionHealth: 'error',
          error: 'No access token available'
        };
      }

      // Make a simple API call to test the connection
      const testEndpoint = this.getTestEndpoint();
      const response = await this.makeApiRequest(testEndpoint, 'GET', undefined, this.getAuthHeaders());

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
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  /**
   * Authenticate (for OAuth2, this initiates the flow)
   */
  async authenticate(): Promise<AuthenticationResult> {
    return this.startOAuth2Flow();
  }

  /**
   * Get rate limit information
   */
  async getRateLimitInfo(): Promise<{ limit: number; remaining: number; resetTime: string }> {
    try {
      await this.ensureAuthenticated();
      
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

      // Default values if endpoint doesn't exist
      return {
        limit: 1000,
        remaining: 1000,
        resetTime: new Date(Date.now() + 3600000).toISOString()
      };

    } catch (error) {
      console.error('Failed to get rate limit info:', error);
      return {
        limit: 1000,
        remaining: 0,
        resetTime: new Date(Date.now() + 3600000).toISOString()
      };
    }
  }

  // Utility methods
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
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
 * Zillow Platform Adapter
 */
export class ZillowAdapter extends OAuth2PlatformAdapter {
  constructor() {
    super(
      'zillow',
      'https://api.zillow.com/v1',
      'https://www.zillow.com/oauth/authorize',
      'https://api.zillow.com/oauth/token',
      ['listings:read', 'listings:write', 'analytics:read']
    );
  }

  protected getTestEndpoint(): string {
    return '/user/profile';
  }

  async publishListing(listingData: PropertyListingData): Promise<ListingPublishResult> {
    try {
      await this.ensureAuthenticated();

      const zillowData = this.transformPropertyData(listingData);
      const response = await this.makeApiRequest(
        '/listings',
        'POST',
        zillowData,
        this.getAuthHeaders()
      );

      return {
        success: true,
        externalListingId: response.listing_id,
        listingUrl: `https://www.zillow.com/listing/${response.listing_id}`,
        message: 'Listing published successfully to Zillow'
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to publish to Zillow'
      };
    }
  }

  async updateListing(externalListingId: string, listingData: Partial<PropertyListingData>): Promise<ListingUpdateResult> {
    try {
      await this.ensureAuthenticated();

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
      await this.ensureAuthenticated();

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
    try {
      await this.ensureAuthenticated();

      return await this.makeApiRequest(
        `/listings/${externalListingId}/status`,
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
      await this.ensureAuthenticated();

      const response = await this.makeApiRequest(
        `/analytics?start_date=${startDate}&end_date=${endDate}`,
        'GET',
        undefined,
        this.getAuthHeaders()
      );

      return {
        platform: 'zillow',
        period: 'custom',
        startDate,
        endDate,
        metrics: {
          totalListings: response.total_listings || 0,
          activeListings: response.active_listings || 0,
          successfulPublications: response.successful_publications || 0,
          failedPublications: response.failed_publications || 0,
          totalViews: response.total_views || 0,
          totalInquiries: response.total_inquiries || 0,
          conversionRate: response.conversion_rate || 0,
          averageTimeToPublish: response.avg_time_to_publish || 0,
          revenue: response.revenue || 0,
          costs: response.costs || 0,
          profit: response.profit || 0
        },
        topPerformingListings: response.top_listings || []
      };

    } catch (error) {
      throw new Error(`Failed to get analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  transformPropertyData(crmData: any): PropertyListingData {
    return {
      propertyId: crmData.id,
      title: crmData.name || 'Property Listing',
      description: crmData.description || '',
      price: crmData.monthlyRent || crmData.price || 0,
      address: crmData.address || '',
      bedrooms: crmData.bedrooms || 0,
      bathrooms: crmData.bathrooms || 0,
      squareFootage: crmData.squareFootage || 0,
      propertyType: crmData.type || 'apartment',
      amenities: crmData.amenities || [],
      photos: crmData.photos || [],
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
      maxPhotos: 50,
      maxDescriptionLength: 1000,
      propertyTypes: ['apartment', 'house', 'condo', 'townhome'],
      priceRange: { min: 1, max: 50000 }
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
    errors.push(...this.validateNumericField(listingData.bedrooms, 'bedrooms', 0, 10));
    errors.push(...this.validateNumericField(listingData.bathrooms, 'bathrooms', 0, 10));

    // Check photos limit
    if (listingData.photos && listingData.photos.length > rules.maxPhotos) {
      errors.push(`Maximum ${rules.maxPhotos} photos allowed`);
    }

    // Check description length
    if (listingData.description && listingData.description.length > rules.maxDescriptionLength) {
      errors.push(`Description must be no more than ${rules.maxDescriptionLength} characters`);
    }

    return { valid: errors.length === 0, errors };
  }

  async handleWebhook(payload: any): Promise<{ processed: boolean; action?: string }> {
    try {
      // Handle Zillow webhook events
      switch (payload.event_type) {
        case 'listing.published':
          // Handle listing published event
          return { processed: true, action: 'listing_published' };
        case 'listing.updated':
          // Handle listing updated event
          return { processed: true, action: 'listing_updated' };
        case 'listing.removed':
          // Handle listing removed event
          return { processed: true, action: 'listing_removed' };
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
 * Trulia Platform Adapter
 */
export class TruliaAdapter extends OAuth2PlatformAdapter {
  constructor() {
    super(
      'trulia',
      'https://api.trulia.com/v1',
      'https://www.trulia.com/oauth/authorize',
      'https://api.trulia.com/oauth/token',
      ['listings:read', 'listings:write', 'analytics:read']
    );
  }

  protected getTestEndpoint(): string {
    return '/user/profile';
  }

  async publishListing(listingData: PropertyListingData): Promise<ListingPublishResult> {
    try {
      await this.ensureAuthenticated();

      const truliaData = this.transformPropertyData(listingData);
      const response = await this.makeApiRequest(
        '/listings',
        'POST',
        truliaData,
        this.getAuthHeaders()
      );

      return {
        success: true,
        externalListingId: response.listing_id,
        listingUrl: `https://www.trulia.com/listing/${response.listing_id}`,
        message: 'Listing published successfully to Trulia'
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to publish to Trulia'
      };
    }
  }

  async updateListing(externalListingId: string, listingData: Partial<PropertyListingData>): Promise<ListingUpdateResult> {
    try {
      await this.ensureAuthenticated();
      const updateData = this.transformPropertyData(listingData);
      await this.makeApiRequest(
        `/listings/${externalListingId}`,
        'PUT',
        updateData,
        this.getAuthHeaders()
      );
      return { success: true, message: 'Listing updated successfully' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update listing' };
    }
  }

  async removeListing(externalListingId: string): Promise<ListingRemovalResult> {
    try {
      await this.ensureAuthenticated();
      await this.makeApiRequest(`/listings/${externalListingId}`, 'DELETE', undefined, this.getAuthHeaders());
      return { success: true, message: 'Listing removed successfully' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to remove listing' };
    }
  }

  async getListingStatus(externalListingId: string): Promise<any> {
    await this.ensureAuthenticated();
    return await this.makeApiRequest(`/listings/${externalListingId}/status`, 'GET', undefined, this.getAuthHeaders());
  }

  async getAnalytics(startDate: string, endDate: string): Promise<PlatformAnalytics> {
    await this.ensureAuthenticated();
    const response = await this.makeApiRequest(
      `/analytics?start_date=${startDate}&end_date=${endDate}`,
      'GET',
      undefined,
      this.getAuthHeaders()
    );

    return {
      platform: 'trulia',
      period: 'custom',
      startDate,
      endDate,
      metrics: {
        totalListings: response.total_listings || 0,
        activeListings: response.active_listings || 0,
        successfulPublications: response.successful_publications || 0,
        failedPublications: response.failed_publications || 0,
        totalViews: response.total_views || 0,
        totalInquiries: response.total_inquiries || 0,
        conversionRate: response.conversion_rate || 0,
        averageTimeToPublish: response.avg_time_to_publish || 0,
        revenue: response.revenue || 0,
        costs: response.costs || 0,
        profit: response.profit || 0
      },
      topPerformingListings: response.top_listings || []
    };
  }

  transformPropertyData(crmData: any): PropertyListingData {
    return {
      propertyId: crmData.id,
      platform: 'trulia',
      title: crmData.name || 'Property Listing',
      description: crmData.description || '',
      price: crmData.monthlyRent || crmData.price || 0,
      priceType: 'monthly',
      propertyType: crmData.type || 'house',
      address: {
        street: crmData.address || '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US'
      },
      details: {
        bedrooms: crmData.bedrooms || 0,
        bathrooms: crmData.bathrooms || 0,
        squareFootage: crmData.squareFootage || 0,
        amenities: crmData.amenities || []
      },
      media: {
        photos: crmData.photos || []
      },
      availability: {
        availableDate: crmData.availableDate || new Date().toISOString().split('T')[0]
      },
      contact: {
        name: crmData.contactName || 'Property Manager',
        email: crmData.contactEmail || '',
        phone: crmData.contactPhone || '',
        preferredContact: 'email'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  getValidationRules(): any {
    return {
      required: ['title', 'price', 'address', 'bedrooms', 'bathrooms'],
      maxPhotos: 35,
      maxDescriptionLength: 1200,
      propertyTypes: ['house', 'condo', 'townhome', 'apartment'],
      priceRange: { min: 1, max: 40000 }
    };
  }

  validateListingData(listingData: PropertyListingData): { valid: boolean; errors: string[] } {
    const rules = this.getValidationRules();
    const errors: string[] = [];

    errors.push(...this.validateRequiredFields(listingData, rules.required));
    errors.push(...this.validateNumericField(listingData.price, 'price', rules.priceRange.min, rules.priceRange.max));
    errors.push(...this.validateNumericField(listingData.details.bedrooms, 'bedrooms', 0, 10));
    errors.push(...this.validateNumericField(listingData.details.bathrooms, 'bathrooms', 0, 10));

    if (listingData.media.photos && listingData.media.photos.length > rules.maxPhotos) {
      errors.push(`Maximum ${rules.maxPhotos} photos allowed`);
    }

    if (listingData.description && listingData.description.length > rules.maxDescriptionLength) {
      errors.push(`Description must be no more than ${rules.maxDescriptionLength} characters`);
    }

    return { valid: errors.length === 0, errors };
  }

  async handleWebhook(payload: any): Promise<{ processed: boolean; action?: string }> {
    try {
      switch (payload.event_type) {
        case 'listing.published':
          return { processed: true, action: 'listing_published' };
        case 'listing.updated':
          return { processed: true, action: 'listing_updated' };
        case 'listing.removed':
          return { processed: true, action: 'listing_removed' };
        default:
          return { processed: false };
      }
    } catch (error) {
      return { processed: false };
    }
  }
}

/**
 * Realtor.com Platform Adapter
 */
export class RealtorComAdapter extends OAuth2PlatformAdapter {
  constructor() {
    super(
      'realtors_com',
      'https://api.realtor.com/v2',
      'https://www.realtor.com/oauth/authorize',
      'https://api.realtor.com/oauth/token',
      ['listings:read', 'listings:write', 'mls:access']
    );
  }

  protected getTestEndpoint(): string {
    return '/user/profile';
  }

  async publishListing(listingData: PropertyListingData): Promise<ListingPublishResult> {
    try {
      await this.ensureAuthenticated();

      const realtorData = this.transformPropertyData(listingData);
      const response = await this.makeApiRequest(
        '/listings',
        'POST',
        realtorData,
        this.getAuthHeaders()
      );

      return {
        success: true,
        externalListingId: response.listing_id,
        listingUrl: `https://www.realtor.com/listing/${response.listing_id}`,
        message: 'Listing published successfully to Realtor.com'
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to publish to Realtor.com'
      };
    }
  }

  async updateListing(externalListingId: string, listingData: Partial<PropertyListingData>): Promise<ListingUpdateResult> {
    try {
      await this.ensureAuthenticated();
      const updateData = this.transformPropertyData(listingData);
      await this.makeApiRequest(
        `/listings/${externalListingId}`,
        'PUT',
        updateData,
        this.getAuthHeaders()
      );
      return { success: true, message: 'Listing updated successfully' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update listing' };
    }
  }

  async removeListing(externalListingId: string): Promise<ListingRemovalResult> {
    try {
      await this.ensureAuthenticated();
      await this.makeApiRequest(`/listings/${externalListingId}`, 'DELETE', undefined, this.getAuthHeaders());
      return { success: true, message: 'Listing removed successfully' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to remove listing' };
    }
  }

  async getListingStatus(externalListingId: string): Promise<any> {
    await this.ensureAuthenticated();
    return await this.makeApiRequest(`/listings/${externalListingId}`, 'GET', undefined, this.getAuthHeaders());
  }

  async getAnalytics(startDate: string, endDate: string): Promise<PlatformAnalytics> {
    await this.ensureAuthenticated();
    const response = await this.makeApiRequest(
      `/analytics?start_date=${startDate}&end_date=${endDate}`,
      'GET',
      undefined,
      this.getAuthHeaders()
    );

    return {
      platform: 'realtors_com',
      period: 'custom',
      startDate,
      endDate,
      metrics: {
        totalListings: response.total_listings || 0,
        activeListings: response.active_listings || 0,
        successfulPublications: response.successful_publications || 0,
        failedPublications: response.failed_publications || 0,
        totalViews: response.total_views || 0,
        totalInquiries: response.total_inquiries || 0,
        conversionRate: response.conversion_rate || 0,
        averageTimeToPublish: response.avg_time_to_publish || 0,
        revenue: response.revenue || 0,
        costs: response.costs || 0,
        profit: response.profit || 0
      },
      topPerformingListings: response.top_listings || []
    };
  }

  transformPropertyData(crmData: any): PropertyListingData {
    return {
      propertyId: crmData.id,
      platform: 'realtors_com',
      title: crmData.name || 'Property Listing',
      description: crmData.description || '',
      price: crmData.monthlyRent || crmData.price || 0,
      priceType: 'monthly',
      propertyType: crmData.type || 'house',
      address: {
        street: crmData.address || '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US'
      },
      details: {
        bedrooms: crmData.bedrooms || 0,
        bathrooms: crmData.bathrooms || 0,
        squareFootage: crmData.squareFootage || 0,
        amenities: crmData.amenities || []
      },
      media: {
        photos: crmData.photos || []
      },
      availability: {
        availableDate: crmData.availableDate || new Date().toISOString().split('T')[0]
      },
      contact: {
        name: crmData.contactName || 'Realtor',
        email: crmData.contactEmail || '',
        phone: crmData.contactPhone || '',
        preferredContact: 'email'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  getValidationRules(): any {
    return {
      required: ['title', 'price', 'address', 'bedrooms', 'bathrooms', 'squareFootage'],
      maxPhotos: 40,
      maxDescriptionLength: 1500,
      propertyTypes: ['house', 'condo', 'townhome', 'land', 'multi-family'],
      priceRange: { min: 1, max: 100000 }
    };
  }

  validateListingData(listingData: PropertyListingData): { valid: boolean; errors: string[] } {
    const rules = this.getValidationRules();
    const errors: string[] = [];

    errors.push(...this.validateRequiredFields(listingData, rules.required));
    errors.push(...this.validateNumericField(listingData.price, 'price', rules.priceRange.min, rules.priceRange.max));
    errors.push(...this.validateNumericField(listingData.details.bedrooms, 'bedrooms', 0, 15));
    errors.push(...this.validateNumericField(listingData.details.bathrooms, 'bathrooms', 0, 15));

    if (!listingData.details.squareFootage) {
      errors.push('Square footage is required for Realtor.com');
    }

    if (listingData.media.photos && listingData.media.photos.length > rules.maxPhotos) {
      errors.push(`Maximum ${rules.maxPhotos} photos allowed`);
    }

    if (listingData.description && listingData.description.length > rules.maxDescriptionLength) {
      errors.push(`Description must be no more than ${rules.maxDescriptionLength} characters`);
    }

    return { valid: errors.length === 0, errors };
  }

  async handleWebhook(payload: any): Promise<{ processed: boolean; action?: string }> {
    try {
      switch (payload.event_type) {
        case 'listing.published':
          return { processed: true, action: 'listing_published' };
        case 'listing.updated':
          return { processed: true, action: 'listing_updated' };
        case 'listing.removed':
          return { processed: true, action: 'listing_removed' };
        default:
          return { processed: false };
      }
    } catch (error) {
      return { processed: false };
    }
  }
}
