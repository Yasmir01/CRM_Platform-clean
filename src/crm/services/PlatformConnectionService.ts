/**
 * Platform Connection Service
 * Main service that manages all platform integrations and provides unified interface
 */

import { LocalStorageService } from './LocalStorageService';
import { BasePlatformAdapter } from './integrations/BasePlatformAdapter';
import { ZillowAdapter, TruliaAdapter, RealtorComAdapter } from './integrations/OAuth2PlatformAdapter';
import { ApartmentsComAdapter, ZumperAdapter } from './integrations/ApiKeyPlatformAdapter';
import { CraigslistAdapter } from './integrations/ScrapingPlatformAdapter';
import type {
  AuthenticationResult,
  ListingPublishResult,
  ListingUpdateResult,
  ListingRemovalResult,
  PlatformConnectionStatus
} from './integrations/BasePlatformAdapter';
import {
  RealEstatePlatform,
  PlatformAuthConfig,
  PropertyListingData,
  PublishingJob,
  PublishingResult,
  PlatformConfiguration,
  PlatformAnalytics
} from '../types/RealEstatePlatformTypes';

interface AdapterConfig {
  adapter: BasePlatformAdapter;
  isConnected: boolean;
  lastConnectionCheck: string;
  connectionHealth: 'healthy' | 'warning' | 'error';
  error?: string;
}

class PlatformConnectionServiceClass {
  private adapters: Map<RealEstatePlatform, AdapterConfig> = new Map();
  private isInitialized = false;

  /**
   * Initialize the connection service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize platform adapters
      this.initializeAdapters();

      // Load stored authentication configs
      await this.loadStoredAuthentications();

      this.isInitialized = true;
      console.log('PlatformConnectionService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PlatformConnectionService:', error);
      throw error;
    }
  }

  /**
   * Initialize all platform adapters
   */
  private initializeAdapters(): void {
    try {
      // OAuth2 Platforms
      this.adapters.set('zillow', {
        adapter: new ZillowAdapter(),
        isConnected: false,
        lastConnectionCheck: new Date().toISOString(),
        connectionHealth: 'error'
      });

      this.adapters.set('trulia', {
        adapter: new TruliaAdapter(),
        isConnected: false,
        lastConnectionCheck: new Date().toISOString(),
        connectionHealth: 'error'
      });

      this.adapters.set('realtors_com', {
        adapter: new RealtorComAdapter(),
        isConnected: false,
        lastConnectionCheck: new Date().toISOString(),
        connectionHealth: 'error'
      });

      // API Key Platforms
      this.adapters.set('apartments_com', {
        adapter: new ApartmentsComAdapter(),
        isConnected: false,
        lastConnectionCheck: new Date().toISOString(),
        connectionHealth: 'error'
      });

      this.adapters.set('zumper', {
        adapter: new ZumperAdapter(),
        isConnected: false,
        lastConnectionCheck: new Date().toISOString(),
        connectionHealth: 'error'
      });

      // Scraping Platforms
      this.adapters.set('craigslist', {
        adapter: new CraigslistAdapter(),
        isConnected: false,
        lastConnectionCheck: new Date().toISOString(),
        connectionHealth: 'error'
      });

      // Initialize mock adapters for other platforms until real implementations are added
      this.initializeMockAdapters();

      console.log(`Initialized ${this.adapters.size} platform adapters`);
    } catch (error) {
      console.error('Failed to initialize platform adapters:', error);
    }
  }

  /**
   * Initialize mock adapters for platforms not yet implemented
   */
  private initializeMockAdapters(): void {
    const mockPlatforms: RealEstatePlatform[] = [
      'rentberry', 'dwellsy', 'rent_jungle',
      'rentprep', 'move_com', 'rentdigs', 'apartment_list', 'cozycozy', 'doorsteps'
    ];

    mockPlatforms.forEach(platform => {
      this.adapters.set(platform, {
        adapter: new MockPlatformAdapter(platform),
        isConnected: false,
        lastConnectionCheck: new Date().toISOString(),
        connectionHealth: 'error'
      });
    });
  }

  /**
   * Load stored authentication configurations
   */
  private async loadStoredAuthentications(): Promise<void> {
    try {
      const storedAuths = LocalStorageService.getItem('platform_authentications', {});
      
      for (const [platform, authConfig] of Object.entries(storedAuths)) {
        const adapterConfig = this.adapters.get(platform as RealEstatePlatform);
        if (adapterConfig && authConfig) {
          try {
            const result = await adapterConfig.adapter.initialize(authConfig as PlatformAuthConfig);
            adapterConfig.isConnected = result.success;
            adapterConfig.connectionHealth = result.success ? 'healthy' : 'error';
            adapterConfig.error = result.success ? undefined : result.error;
            adapterConfig.lastConnectionCheck = new Date().toISOString();
          } catch (error) {
            console.error(`Failed to initialize ${platform}:`, error);
            adapterConfig.isConnected = false;
            adapterConfig.connectionHealth = 'error';
            adapterConfig.error = error instanceof Error ? error.message : 'Initialization failed';
          }
        }
      }
    } catch (error) {
      console.error('Failed to load stored authentications:', error);
    }
  }

  /**
   * Connect to a platform with authentication configuration
   */
  async connectPlatform(
    platform: RealEstatePlatform,
    authConfig: PlatformAuthConfig,
    userId: string
  ): Promise<{ success: boolean; message: string; authUrl?: string }> {
    try {
      const adapterConfig = this.adapters.get(platform);
      if (!adapterConfig) {
        throw new Error(`Platform ${platform} not supported`);
      }

      // Initialize the adapter with auth config
      const result = await adapterConfig.adapter.initialize(authConfig);

      if (result.success) {
        // Store authentication config
        this.storeAuthenticationConfig(platform, authConfig);

        // Update connection status
        adapterConfig.isConnected = true;
        adapterConfig.connectionHealth = 'healthy';
        adapterConfig.error = undefined;
        adapterConfig.lastConnectionCheck = new Date().toISOString();

        // Log successful connection
        this.logConnectionEvent(platform, 'connected', userId, 'Successfully connected to platform');

        return {
          success: true,
          message: result.message || 'Platform connected successfully'
        };
      } else {
        // Update connection status
        adapterConfig.isConnected = false;
        adapterConfig.connectionHealth = 'error';
        adapterConfig.error = result.error;

        // Log failed connection
        this.logConnectionEvent(platform, 'connection_failed', userId, result.error || 'Connection failed');

        return {
          success: false,
          message: result.error || 'Connection failed'
        };
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logConnectionEvent(platform, 'connection_error', userId, message);
      
      return {
        success: false,
        message: `Failed to connect to ${platform}: ${message}`
      };
    }
  }

  /**
   * Disconnect from a platform
   */
  async disconnectPlatform(platform: RealEstatePlatform, userId: string): Promise<boolean> {
    try {
      const adapterConfig = this.adapters.get(platform);
      if (!adapterConfig) {
        return false;
      }

      // Remove stored authentication
      this.removeAuthenticationConfig(platform);

      // Update connection status
      adapterConfig.isConnected = false;
      adapterConfig.connectionHealth = 'error';
      adapterConfig.error = 'Disconnected by user';
      adapterConfig.lastConnectionCheck = new Date().toISOString();

      this.logConnectionEvent(platform, 'disconnected', userId, 'Platform disconnected by user');

      return true;
    } catch (error) {
      console.error(`Failed to disconnect ${platform}:`, error);
      return false;
    }
  }

  /**
   * Test connection to a platform
   */
  async testPlatformConnection(platform: RealEstatePlatform): Promise<{
    isConnected: boolean;
    connectionHealth: 'healthy' | 'warning' | 'error';
    error?: string;
  }> {
    try {
      const adapterConfig = this.adapters.get(platform);
      if (!adapterConfig) {
        return {
          isConnected: false,
          connectionHealth: 'error',
          error: 'Platform not supported'
        };
      }

      const status = await adapterConfig.adapter.testConnection();

      // Update stored status
      adapterConfig.isConnected = status.isConnected;
      adapterConfig.connectionHealth = status.connectionHealth;
      adapterConfig.error = status.error;
      adapterConfig.lastConnectionCheck = new Date().toISOString();

      return {
        isConnected: status.isConnected,
        connectionHealth: status.connectionHealth,
        error: status.error
      };

    } catch (error) {
      return {
        isConnected: false,
        connectionHealth: 'error',
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  /**
   * Get connection status for all platforms
   */
  getAllConnectionStatuses(): Record<RealEstatePlatform, {
    isConnected: boolean;
    connectionHealth: 'healthy' | 'warning' | 'error';
    lastChecked: string;
    error?: string;
  }> {
    const statuses: any = {};

    for (const [platform, config] of this.adapters.entries()) {
      statuses[platform] = {
        isConnected: config.isConnected,
        connectionHealth: config.connectionHealth,
        lastChecked: config.lastConnectionCheck,
        error: config.error
      };
    }

    return statuses;
  }

  /**
   * Publish listing to multiple platforms
   */
  async publishListing(
    propertyData: any,
    platforms: RealEstatePlatform[],
    userId: string
  ): Promise<{
    jobId: string;
    results: PublishingResult[];
    successCount: number;
    failureCount: number;
  }> {
    const jobId = `pub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const results: PublishingResult[] = [];
    let successCount = 0;
    let failureCount = 0;

    // Process each platform
    for (const platform of platforms) {
      try {
        const adapterConfig = this.adapters.get(platform);
        if (!adapterConfig) {
          results.push({
            platform,
            status: 'failed',
            error: 'Platform not supported',
            message: `Platform ${platform} is not supported`
          });
          failureCount++;
          continue;
        }

        if (!adapterConfig.isConnected) {
          results.push({
            platform,
            status: 'failed',
            error: 'Platform not connected',
            message: `Platform ${platform} is not connected. Please authenticate first.`
          });
          failureCount++;
          continue;
        }

        // Transform property data for this platform
        const listingData = adapterConfig.adapter.transformPropertyData(propertyData);

        // Validate data
        const validation = adapterConfig.adapter.validateListingData(listingData);
        if (!validation.valid) {
          results.push({
            platform,
            status: 'failed',
            error: 'Validation failed',
            message: `Validation errors: ${validation.errors.join(', ')}`
          });
          failureCount++;
          continue;
        }

        // Publish to platform
        const publishResult = await adapterConfig.adapter.publishListing(listingData);

        if (publishResult.success) {
          results.push({
            platform,
            status: 'published',
            externalListingId: publishResult.externalListingId,
            listingUrl: publishResult.listingUrl,
            publishedAt: new Date().toISOString(),
            message: publishResult.message
          });
          successCount++;

          // Log successful publication
          this.logConnectionEvent(
            platform, 
            'listing_published', 
            userId, 
            `Listing published successfully: ${publishResult.externalListingId}`
          );
        } else {
          results.push({
            platform,
            status: 'failed',
            error: publishResult.error,
            message: publishResult.message
          });
          failureCount++;

          // Log failed publication
          this.logConnectionEvent(
            platform, 
            'listing_publish_failed', 
            userId, 
            publishResult.error || 'Publication failed'
          );
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          platform,
          status: 'failed',
          error: errorMessage,
          message: `Failed to publish to ${platform}: ${errorMessage}`
        });
        failureCount++;

        this.logConnectionEvent(platform, 'listing_error', userId, errorMessage);
      }

      // Add delay between requests to respect rate limits
      await this.delay(1000);
    }

    // Store publishing job results
    this.storePublishingJob({
      id: jobId,
      propertyId: propertyData.id,
      platforms,
      status: successCount > 0 ? 'completed' : 'failed',
      submittedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      results,
      totalPlatforms: platforms.length,
      successfulPlatforms: successCount,
      failedPlatforms: failureCount
    });

    return {
      jobId,
      results,
      successCount,
      failureCount
    };
  }

  /**
   * Update listing on platforms
   */
  async updateListing(
    externalListingId: string,
    platform: RealEstatePlatform,
    propertyData: Partial<any>,
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const adapterConfig = this.adapters.get(platform);
      if (!adapterConfig || !adapterConfig.isConnected) {
        throw new Error(`Platform ${platform} not connected`);
      }

      const listingData = adapterConfig.adapter.transformPropertyData(propertyData);
      const result = await adapterConfig.adapter.updateListing(externalListingId, listingData);

      this.logConnectionEvent(
        platform,
        result.success ? 'listing_updated' : 'listing_update_failed',
        userId,
        result.message || (result.success ? 'Listing updated' : 'Update failed')
      );

      return {
        success: result.success,
        message: result.message || (result.success ? 'Listing updated successfully' : 'Update failed')
      };

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logConnectionEvent(platform, 'listing_update_error', userId, message);
      return { success: false, message };
    }
  }

  /**
   * Remove listing from platform
   */
  async removeListing(
    externalListingId: string,
    platform: RealEstatePlatform,
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const adapterConfig = this.adapters.get(platform);
      if (!adapterConfig || !adapterConfig.isConnected) {
        throw new Error(`Platform ${platform} not connected`);
      }

      const result = await adapterConfig.adapter.removeListing(externalListingId);

      this.logConnectionEvent(
        platform,
        result.success ? 'listing_removed' : 'listing_removal_failed',
        userId,
        result.message || (result.success ? 'Listing removed' : 'Removal failed')
      );

      return {
        success: result.success,
        message: result.message || (result.success ? 'Listing removed successfully' : 'Removal failed')
      };

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logConnectionEvent(platform, 'listing_removal_error', userId, message);
      return { success: false, message };
    }
  }

  /**
   * Get platform analytics
   */
  async getPlatformAnalytics(
    platform: RealEstatePlatform,
    startDate: string,
    endDate: string
  ): Promise<PlatformAnalytics | null> {
    try {
      const adapterConfig = this.adapters.get(platform);
      if (!adapterConfig || !adapterConfig.isConnected) {
        return null;
      }

      return await adapterConfig.adapter.getAnalytics(startDate, endDate);
    } catch (error) {
      console.error(`Failed to get analytics for ${platform}:`, error);
      return null;
    }
  }

  /**
   * Get rate limit information for all connected platforms
   */
  async getAllRateLimits(): Promise<Record<RealEstatePlatform, {
    limit: number;
    remaining: number;
    resetTime: string;
  }>> {
    const rateLimits: any = {};

    for (const [platform, config] of this.adapters.entries()) {
      if (config.isConnected) {
        try {
          rateLimits[platform] = await config.adapter.getRateLimitInfo();
        } catch (error) {
          console.error(`Failed to get rate limit for ${platform}:`, error);
        }
      }
    }

    return rateLimits;
  }

  /**
   * Handle webhook from platform
   */
  async handleWebhook(
    platform: RealEstatePlatform,
    payload: any
  ): Promise<{ processed: boolean; action?: string }> {
    try {
      const adapterConfig = this.adapters.get(platform);
      if (!adapterConfig) {
        return { processed: false };
      }

      return await adapterConfig.adapter.handleWebhook(payload);
    } catch (error) {
      console.error(`Webhook handling failed for ${platform}:`, error);
      return { processed: false };
    }
  }

  /**
   * Get supported platforms
   */
  getSupportedPlatforms(): RealEstatePlatform[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Check if platform is supported
   */
  isPlatformSupported(platform: RealEstatePlatform): boolean {
    return this.adapters.has(platform);
  }

  /**
   * Get platform adapter for direct access (advanced use)
   */
  getPlatformAdapter(platform: RealEstatePlatform): BasePlatformAdapter | null {
    const config = this.adapters.get(platform);
    return config ? config.adapter : null;
  }

  // Private utility methods

  private storeAuthenticationConfig(platform: RealEstatePlatform, authConfig: PlatformAuthConfig): void {
    try {
      const storedAuths = LocalStorageService.getItem('platform_authentications', {});
      storedAuths[platform] = authConfig;
      LocalStorageService.setItem('platform_authentications', storedAuths);
    } catch (error) {
      console.error('Failed to store authentication config:', error);
    }
  }

  private removeAuthenticationConfig(platform: RealEstatePlatform): void {
    try {
      const storedAuths = LocalStorageService.getItem('platform_authentications', {});
      delete storedAuths[platform];
      LocalStorageService.setItem('platform_authentications', storedAuths);
    } catch (error) {
      console.error('Failed to remove authentication config:', error);
    }
  }

  private storePublishingJob(job: PublishingJob): void {
    try {
      const jobs = LocalStorageService.getItem('publishing_jobs', []);
      jobs.unshift(job);
      
      // Keep only last 100 jobs
      if (jobs.length > 100) {
        jobs.splice(100);
      }
      
      LocalStorageService.setItem('publishing_jobs', jobs);
    } catch (error) {
      console.error('Failed to store publishing job:', error);
    }
  }

  private logConnectionEvent(
    platform: RealEstatePlatform,
    action: string,
    userId: string,
    message: string
  ): void {
    try {
      const logs = LocalStorageService.getItem('platform_connection_logs', []);
      logs.unshift({
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        timestamp: new Date().toISOString(),
        platform,
        action,
        userId,
        userEmail: 'user@example.com',
        message,
        status: action.includes('failed') || action.includes('error') ? 'failure' : 'success'
      });

      // Keep only last 500 logs
      if (logs.length > 500) {
        logs.splice(500);
      }

      LocalStorageService.setItem('platform_connection_logs', logs);
    } catch (error) {
      console.error('Failed to log connection event:', error);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Mock Platform Adapter for platforms not yet implemented
 */
class MockPlatformAdapter extends BasePlatformAdapter {
  constructor(platform: RealEstatePlatform) {
    super(platform, `https://api.${platform}.com`);
  }

  async initialize(authConfig: PlatformAuthConfig): Promise<AuthenticationResult> {
    return {
      success: false,
      error: `${this.platform} integration coming soon! Please check back later.`
    };
  }

  async authenticate(): Promise<AuthenticationResult> {
    return {
      success: false,
      error: `${this.platform} integration coming soon!`
    };
  }

  async refreshAuthentication(): Promise<AuthenticationResult> {
    return { success: false, error: 'Not implemented' };
  }

  async testConnection(): Promise<PlatformConnectionStatus> {
    return {
      isConnected: false,
      lastChecked: new Date().toISOString(),
      connectionHealth: 'error',
      error: `${this.platform} integration coming soon!`
    };
  }

  async publishListing(listingData: PropertyListingData): Promise<ListingPublishResult> {
    return {
      success: false,
      error: `${this.platform} integration coming soon! This platform will be available in a future update.`
    };
  }

  async updateListing(externalListingId: string, listingData: Partial<PropertyListingData>): Promise<ListingUpdateResult> {
    return {
      success: false,
      error: `${this.platform} integration coming soon!`
    };
  }

  async removeListing(externalListingId: string): Promise<ListingRemovalResult> {
    return {
      success: false,
      error: `${this.platform} integration coming soon!`
    };
  }

  async getListingStatus(externalListingId: string): Promise<any> {
    throw new Error(`${this.platform} integration coming soon!`);
  }

  async getAnalytics(startDate: string, endDate: string): Promise<PlatformAnalytics> {
    return {
      platform: this.platform,
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
      propertyId: crmData.id || '',
      platform: this.platform,
      title: crmData.name || 'Property Listing',
      description: crmData.description || '',
      price: crmData.monthlyRent || crmData.price || 0,
      priceType: 'monthly',
      propertyType: crmData.type || 'apartment',
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
        squareFootage: crmData.squareFootage,
        amenities: crmData.amenities || []
      },
      media: {
        photos: crmData.photos || []
      },
      availability: {
        availableDate: crmData.availableDate || new Date().toISOString().split('T')[0]
      },
      contact: {
        name: crmData.contactName || '',
        phone: crmData.contactPhone || '',
        email: crmData.contactEmail || '',
        preferredContact: 'email'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  getValidationRules(): any {
    return {
      required: ['title', 'price'],
      maxPhotos: 20,
      maxDescriptionLength: 1000
    };
  }

  validateListingData(listingData: PropertyListingData): { valid: boolean; errors: string[] } {
    return {
      valid: false,
      errors: [`${this.platform} integration coming soon!`]
    };
  }

  async handleWebhook(payload: any): Promise<{ processed: boolean; action?: string }> {
    return { processed: false };
  }

  async getRateLimitInfo(): Promise<{ limit: number; remaining: number; resetTime: string }> {
    return {
      limit: 0,
      remaining: 0,
      resetTime: new Date().toISOString()
    };
  }

  protected getAuthHeaders(): Record<string, string> {
    return {};
  }
}

// Export singleton instance
export const PlatformConnectionService = new PlatformConnectionServiceClass();
export default PlatformConnectionService;
