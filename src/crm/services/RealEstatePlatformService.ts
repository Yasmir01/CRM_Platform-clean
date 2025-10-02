/**
 * Real Estate Platform Integration Service
 * Main service for managing all real estate platform integrations
 * Now uses real API connections instead of mock implementations
 */

import { LocalStorageService } from './LocalStorageService';
import { PlatformConnectionService } from './PlatformConnectionService';
import { ListingPublishingService } from './ListingPublishingService';
import {
  RealEstatePlatform,
  PlatformConfiguration,
  PlatformAuthConfig,
  PropertyListingData,
  PublishingJob,
  PublishingResult,
  PlatformBundle,
  SuperAdminPlatformSettings,
  PlatformAnalytics,
  PlatformIntegrationLog,
  ValidationResult,
  AuthenticationType,
  PlatformStatus,
  PublishingStatus
} from '../types/RealEstatePlatformTypes';

class RealEstatePlatformServiceClass {
  private platformConfigs: Map<RealEstatePlatform, PlatformConfiguration> = new Map();
  private authenticated: Map<RealEstatePlatform, boolean> = new Map();
  private publishingJobs: Map<string, PublishingJob> = new Map();
  private isInitialized = false;

  /**
   * Initialize the service and load configurations
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize real connection services
      await PlatformConnectionService.initialize();
      await ListingPublishingService.initialize();

      // Load platform configurations from storage
      const configs = this.loadPlatformConfigurations();
      configs.forEach(config => {
        this.platformConfigs.set(config.platform, config);
      });

      // Get real connection status from PlatformConnectionService
      const connectionStatuses = PlatformConnectionService.getAllConnectionStatuses();
      Object.entries(connectionStatuses).forEach(([platform, status]) => {
        this.authenticated.set(platform as RealEstatePlatform, status.isConnected);
      });

      // Initialize default platform configurations
      this.initializeDefaultPlatforms();

      this.isInitialized = true;
      console.log('RealEstatePlatformService initialized with real connections');
    } catch (error) {
      console.error('Failed to initialize RealEstatePlatformService:', error);
      throw error;
    }
  }

  /**
   * Get all available platforms
   */
  getAvailablePlatforms(): PlatformConfiguration[] {
    return Array.from(this.platformConfigs.values())
      .filter(config => this.isVisibleToUser(config))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
  }

  /**
   * Get platform configuration
   */
  getPlatformConfig(platform: RealEstatePlatform): PlatformConfiguration | null {
    return this.platformConfigs.get(platform) || null;
  }

  /**
   * Update platform configuration (Super Admin only)
   */
  async updatePlatformConfig(
    platform: RealEstatePlatform, 
    config: Partial<PlatformConfiguration>,
    adminUserId: string
  ): Promise<boolean> {
    try {
      const existingConfig = this.platformConfigs.get(platform);
      if (!existingConfig) {
        throw new Error(`Platform ${platform} not found`);
      }

      const updatedConfig: PlatformConfiguration = {
        ...existingConfig,
        ...config,
        updatedAt: new Date().toISOString()
      };

      this.platformConfigs.set(platform, updatedConfig);
      this.savePlatformConfigurations();

      // Log the change
      this.logActivity({
        platform,
        action: 'update',
        status: 'success',
        message: `Platform configuration updated by admin`,
        userId: adminUserId,
        userEmail: 'admin@system.com'
      });

      return true;
    } catch (error) {
      console.error(`Failed to update platform config for ${platform}:`, error);
      return false;
    }
  }

  /**
   * Authenticate with a platform using real connection service
   */
  async authenticatePlatform(
    platform: RealEstatePlatform,
    authData: Partial<PlatformAuthConfig>,
    userId: string
  ): Promise<{ success: boolean; message: string; authUrl?: string }> {
    try {
      const config = this.platformConfigs.get(platform);
      if (!config) {
        return { success: false, message: 'Platform not found' };
      }

      // Use real connection service for authentication
      const authConfig: PlatformAuthConfig = {
        ...config.authConfig,
        ...authData,
        environment: authData.environment || 'sandbox'
      };

      const result = await PlatformConnectionService.connectPlatform(platform, authConfig, userId);

      if (result.success) {
        this.authenticated.set(platform, true);
        config.status = 'active';
        config.lastSync = new Date().toISOString();
        config.authConfig = authConfig;

        this.savePlatformConfigurations();

        this.logActivity({
          platform,
          action: 'auth',
          status: 'success',
          message: 'Successfully authenticated with platform',
          userId,
          userEmail: 'user@example.com'
        });
      } else {
        this.authenticated.set(platform, false);
        config.status = 'error';

        this.logActivity({
          platform,
          action: 'auth',
          status: 'failure',
          message: result.message || 'Authentication failed',
          userId,
          userEmail: 'user@example.com'
        });
      }

      return result;
    } catch (error) {
      console.error(`Authentication failed for ${platform}:`, error);
      return {
        success: false,
        message: `Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Check if platform is authenticated using real connection status
   */
  isPlatformAuthenticated(platform: RealEstatePlatform): boolean {
    try {
      const connectionStatuses = PlatformConnectionService.getAllConnectionStatuses();
      return connectionStatuses[platform]?.isConnected || false;
    } catch (error) {
      // Fallback to stored status
      return this.authenticated.get(platform) || false;
    }
  }

  /**
   * Publish property to multiple platforms using real publishing service
   */
  async publishProperty(
    propertyData: PropertyListingData,
    platforms: RealEstatePlatform[],
    userId: string
  ): Promise<PublishingJob> {
    try {
      // Use real listing publishing service
      const result = await ListingPublishingService.publishProperty(
        propertyData,
        platforms,
        { userId }
      );

      if (result.success && result.jobId) {
        // Get the job from publishing service
        const job = ListingPublishingService.getPublishingJob(result.jobId);
        if (job) {
          this.publishingJobs.set(job.id, job);
          return job;
        }
      }

      // Fallback: create job with results
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const job: PublishingJob = {
        id: jobId,
        propertyId: propertyData.propertyId,
        platforms,
        status: result.success ? 'completed' : 'failed',
        submittedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        results: result.results || [],
        totalPlatforms: platforms.length,
        successfulPlatforms: result.results?.filter(r => r.status === 'published').length || 0,
        failedPlatforms: result.results?.filter(r => r.status === 'failed').length || 0
      };

      this.publishingJobs.set(jobId, job);
      return job;

    } catch (error) {
      // Fallback error job
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const job: PublishingJob = {
        id: jobId,
        propertyId: propertyData.propertyId,
        platforms,
        status: 'failed',
        submittedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        results: platforms.map(platform => ({
          platform,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })),
        totalPlatforms: platforms.length,
        successfulPlatforms: 0,
        failedPlatforms: platforms.length
      };

      this.publishingJobs.set(jobId, job);
      return job;
    }
  }

  /**
   * Get publishing job status
   */
  getPublishingJob(jobId: string): PublishingJob | null {
    return this.publishingJobs.get(jobId) || null;
  }

  /**
   * Get all publishing jobs for a property
   */
  getPropertyPublishingJobs(propertyId: string): PublishingJob[] {
    return Array.from(this.publishingJobs.values())
      .filter(job => job.propertyId === propertyId)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  /**
   * Remove property from platforms using real connection service
   */
  async removePropertyFromPlatforms(
    propertyId: string,
    platforms: RealEstatePlatform[],
    userId: string
  ): Promise<PublishingResult[]> {
    try {
      // Use real listing publishing service for removal
      const result = await ListingPublishingService.removeListing(propertyId, platforms, userId);

      return result.results.map(r => ({
        platform: r.platform,
        status: r.success ? 'removed' : 'failed',
        message: r.message,
        error: r.success ? undefined : r.message
      }));

    } catch (error) {
      // Fallback error handling
      return platforms.map(platform => ({
        platform,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to remove property'
      }));
    }
  }

  /**
   * Get platform analytics using real connection service
   */
  async getPlatformAnalytics(
    platform: RealEstatePlatform,
    period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'
  ): Promise<PlatformAnalytics | null> {
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();

      switch (period) {
        case 'daily':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case 'weekly':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'monthly':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'yearly':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      // Use real connection service to get analytics
      const analytics = await PlatformConnectionService.getPlatformAnalytics(
        platform,
        startDate.toISOString().split('T')[0],
        endDate
      );

      return analytics;

    } catch (error) {
      console.error(`Failed to get analytics for ${platform}:`, error);
      return null;
    }
  }

  /**
   * Private methods
   */

  private async performAuthentication(
    platform: RealEstatePlatform,
    authConfig?: PlatformAuthConfig
  ): Promise<{ success: boolean; message?: string }> {
    if (!authConfig) {
      return { success: false, message: 'No authentication configuration provided' };
    }

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In real implementation, this would call actual platform APIs
    switch (platform) {
      case 'zillow':
        return this.authenticateZillow(authConfig);
      case 'apartments_com':
        return this.authenticateApartmentsCom(authConfig);
      case 'craigslist':
        return this.authenticateCraigslist(authConfig);
      default:
        return this.authenticateGeneric(platform, authConfig);
    }
  }

  private async authenticateZillow(authConfig: PlatformAuthConfig): Promise<{ success: boolean; message?: string }> {
    if (!authConfig.clientId || !authConfig.clientSecret) {
      return { success: false, message: 'Client ID and Client Secret are required for Zillow' };
    }
    // Simulate Zillow OAuth flow
    return { success: true, message: 'Successfully authenticated with Zillow' };
  }

  private async authenticateApartmentsCom(authConfig: PlatformAuthConfig): Promise<{ success: boolean; message?: string }> {
    if (!authConfig.apiKey) {
      return { success: false, message: 'API Key is required for Apartments.com' };
    }
    return { success: true, message: 'Successfully authenticated with Apartments.com' };
  }

  private async authenticateCraigslist(authConfig: PlatformAuthConfig): Promise<{ success: boolean; message?: string }> {
    if (!authConfig.username || !authConfig.password) {
      return { success: false, message: 'Username and password are required for Craigslist' };
    }
    return { success: true, message: 'Successfully authenticated with Craigslist' };
  }

  private async authenticateGeneric(
    platform: RealEstatePlatform,
    authConfig: PlatformAuthConfig
  ): Promise<{ success: boolean; message?: string }> {
    // Generic authentication for other platforms
    const hasRequiredAuth = authConfig.apiKey || 
                           authConfig.clientId || 
                           (authConfig.username && authConfig.password);
    
    if (!hasRequiredAuth) {
      return { success: false, message: 'Required authentication credentials not provided' };
    }

    return { success: true, message: `Successfully authenticated with ${platform}` };
  }

  private async processPublishingJob(job: PublishingJob, propertyData: PropertyListingData, userId: string): Promise<void> {
    job.status = 'pending';
    
    for (const platform of job.platforms) {
      try {
        const result = await this.publishToPlatform(platform, propertyData);
        job.results.push(result);
        
        if (result.status === 'published') {
          job.successfulPlatforms++;
        } else {
          job.failedPlatforms++;
        }

        this.logActivity({
          platform,
          action: 'publish',
          propertyId: propertyData.propertyId,
          status: result.status === 'published' ? 'success' : 'failure',
          message: result.message || 'Property publication attempt',
          details: result,
          userId,
          userEmail: 'user@example.com'
        });

      } catch (error) {
        const errorResult: PublishingResult = {
          platform,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        job.results.push(errorResult);
        job.failedPlatforms++;
      }
    }

    job.status = job.successfulPlatforms > 0 ? 'completed' : 'failed';
    job.completedAt = new Date().toISOString();
  }

  private async publishToPlatform(platform: RealEstatePlatform, propertyData: PropertyListingData): Promise<PublishingResult> {
    if (!this.isPlatformAuthenticated(platform)) {
      return {
        platform,
        status: 'failed',
        error: 'Platform not authenticated',
        message: 'Authentication required before publishing'
      };
    }

    // Simulate publishing delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 1000));

    // Simulate success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      const externalId = `${platform}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const listingUrl = `https://${platform}.com/listing/${externalId}`;
      
      return {
        platform,
        status: 'published',
        externalListingId: externalId,
        listingUrl,
        publishedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        message: 'Property published successfully'
      };
    } else {
      return {
        platform,
        status: 'failed',
        error: 'Platform temporarily unavailable',
        message: 'Failed to publish property. Please try again later.'
      };
    }
  }

  private async removePlatformListing(platform: RealEstatePlatform, propertyId: string): Promise<boolean> {
    // Simulate removal
    await new Promise(resolve => setTimeout(resolve, 1000));
    return Math.random() > 0.2; // 80% success rate
  }

  private isVisibleToUser(config: PlatformConfiguration): boolean {
    // In real implementation, check user permissions and platform visibility settings
    return config.status !== 'suspended';
  }

  private initializeDefaultPlatforms(): void {
    const defaultPlatforms: PlatformConfiguration[] = [
      {
        id: 'zillow_001',
        platform: 'zillow',
        displayName: 'Zillow',
        description: 'Largest online real estate marketplace in the US',
        websiteUrl: 'https://zillow.com',
        status: 'inactive',
        authenticationType: 'oauth2',
        pricing: {
          id: 'zillow_pricing',
          platform: 'zillow',
          priceType: 'per_listing',
          basePrice: 9.99,
          currency: 'USD',
          bundleEligible: true,
          isActive: true,
          effectiveDate: new Date().toISOString()
        },
        features: ['MLS Integration', 'Photo Upload', 'Virtual Tours', 'Lead Generation'],
        supportedPropertyTypes: ['Apartment', 'House', 'Condo', 'Townhome'],
        maxPhotos: 50,
        maxDescriptionLength: 1000,
        requiredFields: ['title', 'price', 'address', 'bedrooms', 'bathrooms'],
        optionalFields: ['amenities', 'petPolicy', 'parking'],
        geographicCoverage: ['United States'],
        processingTime: '1-2 hours',
        autoRenewal: true,
        listingDuration: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncFrequency: 'daily'
      },
      {
        id: 'apartments_com_001',
        platform: 'apartments_com',
        displayName: 'Apartments.com',
        description: 'Leading apartment search website',
        websiteUrl: 'https://apartments.com',
        status: 'inactive',
        authenticationType: 'api_key',
        pricing: {
          id: 'apartments_com_pricing',
          platform: 'apartments_com',
          priceType: 'monthly_subscription',
          basePrice: 49.99,
          currency: 'USD',
          bundleEligible: true,
          isActive: true,
          effectiveDate: new Date().toISOString()
        },
        features: ['Featured Listings', 'Photo Gallery', 'Contact Management', 'Analytics'],
        supportedPropertyTypes: ['Apartment', 'Condo', 'Townhome'],
        maxPhotos: 25,
        maxDescriptionLength: 2000,
        requiredFields: ['title', 'price', 'address', 'bedrooms', 'bathrooms', 'squareFootage'],
        optionalFields: ['amenities', 'petPolicy', 'utilities'],
        geographicCoverage: ['United States'],
        processingTime: 'Immediate',
        autoRenewal: true,
        listingDuration: 60,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncFrequency: 'real_time'
      },
      {
        id: 'realtors_com_001',
        platform: 'realtors_com',
        displayName: 'Realtor.com',
        description: 'Official site of the National Association of Realtors',
        websiteUrl: 'https://realtor.com',
        status: 'inactive',
        authenticationType: 'oauth2',
        pricing: {
          id: 'realtors_com_pricing',
          platform: 'realtors_com',
          priceType: 'per_listing',
          basePrice: 12.99,
          currency: 'USD',
          bundleEligible: true,
          isActive: true,
          effectiveDate: new Date().toISOString()
        },
        features: ['MLS Direct Access', 'Premium Placement', 'Agent Directory', 'Market Insights'],
        supportedPropertyTypes: ['House', 'Condo', 'Townhome', 'Land', 'Multi-Family'],
        maxPhotos: 40,
        maxDescriptionLength: 1500,
        requiredFields: ['title', 'price', 'address', 'bedrooms', 'bathrooms', 'squareFootage'],
        optionalFields: ['yearBuilt', 'lotSize', 'garage', 'basement'],
        geographicCoverage: ['United States'],
        processingTime: '2-4 hours',
        autoRenewal: true,
        listingDuration: 90,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncFrequency: 'daily'
      },
      {
        id: 'craigslist_001',
        platform: 'craigslist',
        displayName: 'Craigslist',
        description: 'Classified advertisements website',
        websiteUrl: 'https://craigslist.org',
        status: 'inactive',
        authenticationType: 'scraping_based',
        pricing: {
          id: 'craigslist_pricing',
          platform: 'craigslist',
          priceType: 'per_listing',
          basePrice: 5.00,
          currency: 'USD',
          bundleEligible: true,
          isActive: true,
          effectiveDate: new Date().toISOString()
        },
        features: ['Wide Local Reach', 'Simple Posting', 'Cost Effective'],
        supportedPropertyTypes: ['Apartment', 'House', 'Room', 'Sublet'],
        maxPhotos: 8,
        maxDescriptionLength: 500,
        requiredFields: ['title', 'price', 'address'],
        optionalFields: ['amenities', 'utilities'],
        geographicCoverage: ['United States', 'Canada', 'International'],
        processingTime: 'Immediate',
        autoRenewal: false,
        listingDuration: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncFrequency: 'manual'
      },
      {
        id: 'trulia_001',
        platform: 'trulia',
        displayName: 'Trulia',
        description: 'Real estate website owned by Zillow',
        websiteUrl: 'https://trulia.com',
        status: 'inactive',
        authenticationType: 'oauth2',
        pricing: {
          id: 'trulia_pricing',
          platform: 'trulia',
          priceType: 'per_listing',
          basePrice: 8.99,
          currency: 'USD',
          bundleEligible: true,
          isActive: true,
          effectiveDate: new Date().toISOString()
        },
        features: ['Crime Maps', 'School Ratings', 'Neighborhood Insights', 'Price History'],
        supportedPropertyTypes: ['House', 'Condo', 'Townhome', 'Apartment'],
        maxPhotos: 35,
        maxDescriptionLength: 1200,
        requiredFields: ['title', 'price', 'address', 'bedrooms', 'bathrooms'],
        optionalFields: ['walkScore', 'schoolDistrict'],
        geographicCoverage: ['United States'],
        processingTime: '1-3 hours',
        autoRenewal: true,
        listingDuration: 45,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncFrequency: 'daily'
      },
      {
        id: 'rentberry_001',
        platform: 'rentberry',
        displayName: 'Rentberry',
        description: 'Rental platform with automated bidding',
        websiteUrl: 'https://rentberry.com',
        status: 'inactive',
        authenticationType: 'api_key',
        pricing: {
          id: 'rentberry_pricing',
          platform: 'rentberry',
          priceType: 'commission_based',
          basePrice: 0,
          currency: 'USD',
          bundleEligible: false,
          isActive: true,
          effectiveDate: new Date().toISOString()
        },
        features: ['Automated Bidding', 'Tenant Screening', 'Digital Leasing', 'Payment Processing'],
        supportedPropertyTypes: ['Apartment', 'House', 'Condo'],
        maxPhotos: 20,
        maxDescriptionLength: 800,
        requiredFields: ['title', 'price', 'address', 'bedrooms', 'bathrooms'],
        optionalFields: ['amenities', 'petPolicy'],
        geographicCoverage: ['United States', 'United Kingdom'],
        processingTime: '30 minutes',
        autoRenewal: true,
        listingDuration: 60,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncFrequency: 'real_time'
      },
      {
        id: 'dwellsy_001',
        platform: 'dwellsy',
        displayName: 'Dwellsy',
        description: 'Rental marketplace with no broker fees',
        websiteUrl: 'https://dwellsy.com',
        status: 'inactive',
        authenticationType: 'api_key',
        pricing: {
          id: 'dwellsy_pricing',
          platform: 'dwellsy',
          priceType: 'flat_fee',
          basePrice: 25.00,
          currency: 'USD',
          bundleEligible: true,
          isActive: true,
          effectiveDate: new Date().toISOString()
        },
        features: ['No Broker Fees', 'Direct Landlord Contact', 'Virtual Tours'],
        supportedPropertyTypes: ['Apartment', 'House', 'Studio'],
        maxPhotos: 15,
        maxDescriptionLength: 600,
        requiredFields: ['title', 'price', 'address', 'bedrooms', 'bathrooms'],
        optionalFields: ['petPolicy', 'amenities'],
        geographicCoverage: ['New York', 'New Jersey', 'Connecticut'],
        processingTime: '1 hour',
        autoRenewal: true,
        listingDuration: 45,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncFrequency: 'daily'
      },
      {
        id: 'zumper_001',
        platform: 'zumper',
        displayName: 'Zumper',
        description: 'Apartment rental platform',
        websiteUrl: 'https://zumper.com',
        status: 'inactive',
        authenticationType: 'oauth2',
        pricing: {
          id: 'zumper_pricing',
          platform: 'zumper',
          priceType: 'per_listing',
          basePrice: 15.99,
          currency: 'USD',
          bundleEligible: true,
          isActive: true,
          effectiveDate: new Date().toISOString()
        },
        features: ['Instant Applications', '3D Floor Plans', 'Market Analytics'],
        supportedPropertyTypes: ['Apartment', 'Condo', 'Townhome'],
        maxPhotos: 30,
        maxDescriptionLength: 1000,
        requiredFields: ['title', 'price', 'address', 'bedrooms', 'bathrooms'],
        optionalFields: ['floorPlan', 'amenities'],
        geographicCoverage: ['United States', 'Canada'],
        processingTime: '2 hours',
        autoRenewal: true,
        listingDuration: 60,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncFrequency: 'daily'
      },
      {
        id: 'rent_jungle_001',
        platform: 'rent_jungle',
        displayName: 'Rent Jungle',
        description: 'Apartment search and rental listings',
        websiteUrl: 'https://rentjungle.com',
        status: 'inactive',
        authenticationType: 'api_key',
        pricing: {
          id: 'rent_jungle_pricing',
          platform: 'rent_jungle',
          priceType: 'monthly_subscription',
          basePrice: 29.99,
          currency: 'USD',
          bundleEligible: true,
          isActive: true,
          effectiveDate: new Date().toISOString()
        },
        features: ['Market Reports', 'Rent Comparisons', 'Neighborhood Data'],
        supportedPropertyTypes: ['Apartment', 'House', 'Condo'],
        maxPhotos: 20,
        maxDescriptionLength: 800,
        requiredFields: ['title', 'price', 'address', 'bedrooms', 'bathrooms'],
        optionalFields: ['amenities', 'utilities'],
        geographicCoverage: ['United States'],
        processingTime: '4 hours',
        autoRenewal: true,
        listingDuration: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncFrequency: 'daily'
      },
      {
        id: 'rentprep_001',
        platform: 'rentprep',
        displayName: 'RentPrep',
        description: 'Landlord and property management platform',
        websiteUrl: 'https://rentprep.com',
        status: 'inactive',
        authenticationType: 'username_password',
        pricing: {
          id: 'rentprep_pricing',
          platform: 'rentprep',
          priceType: 'per_listing',
          basePrice: 7.99,
          currency: 'USD',
          bundleEligible: true,
          isActive: true,
          effectiveDate: new Date().toISOString()
        },
        features: ['Tenant Screening', 'Credit Reports', 'Background Checks'],
        supportedPropertyTypes: ['Apartment', 'House', 'Duplex', 'Mobile Home'],
        maxPhotos: 12,
        maxDescriptionLength: 500,
        requiredFields: ['title', 'price', 'address'],
        optionalFields: ['petPolicy', 'utilities'],
        geographicCoverage: ['United States'],
        processingTime: '6 hours',
        autoRenewal: false,
        listingDuration: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncFrequency: 'weekly'
      },
      {
        id: 'move_com_001',
        platform: 'move_com',
        displayName: 'Move.com',
        description: 'Real estate and moving services',
        websiteUrl: 'https://move.com',
        status: 'inactive',
        authenticationType: 'oauth2',
        pricing: {
          id: 'move_com_pricing',
          platform: 'move_com',
          priceType: 'per_listing',
          basePrice: 11.99,
          currency: 'USD',
          bundleEligible: true,
          isActive: true,
          effectiveDate: new Date().toISOString()
        },
        features: ['Moving Services', 'Real Estate Insights', 'Agent Network'],
        supportedPropertyTypes: ['House', 'Condo', 'Townhome'],
        maxPhotos: 25,
        maxDescriptionLength: 1000,
        requiredFields: ['title', 'price', 'address', 'bedrooms', 'bathrooms'],
        optionalFields: ['yearBuilt', 'lotSize'],
        geographicCoverage: ['United States'],
        processingTime: '3 hours',
        autoRenewal: true,
        listingDuration: 60,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncFrequency: 'daily'
      },
      {
        id: 'rentdigs_001',
        platform: 'rentdigs',
        displayName: 'RentDigs',
        description: 'Rental property marketplace',
        websiteUrl: 'https://rentdigs.com',
        status: 'inactive',
        authenticationType: 'api_key',
        pricing: {
          id: 'rentdigs_pricing',
          platform: 'rentdigs',
          priceType: 'flat_fee',
          basePrice: 19.99,
          currency: 'USD',
          bundleEligible: true,
          isActive: true,
          effectiveDate: new Date().toISOString()
        },
        features: ['Property Management Tools', 'Tenant Portal', 'Maintenance Tracking'],
        supportedPropertyTypes: ['Apartment', 'House', 'Condo'],
        maxPhotos: 18,
        maxDescriptionLength: 700,
        requiredFields: ['title', 'price', 'address', 'bedrooms'],
        optionalFields: ['amenities', 'petPolicy'],
        geographicCoverage: ['United States'],
        processingTime: '2 hours',
        autoRenewal: true,
        listingDuration: 45,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncFrequency: 'daily'
      },
      {
        id: 'apartment_list_001',
        platform: 'apartment_list',
        displayName: 'Apartment List',
        description: 'Commission-free apartment search',
        websiteUrl: 'https://apartmentlist.com',
        status: 'inactive',
        authenticationType: 'oauth2',
        pricing: {
          id: 'apartment_list_pricing',
          platform: 'apartment_list',
          priceType: 'commission_based',
          basePrice: 0,
          currency: 'USD',
          bundleEligible: false,
          isActive: true,
          effectiveDate: new Date().toISOString()
        },
        features: ['Commission Free', 'Renter Rewards', 'Personalized Recommendations'],
        supportedPropertyTypes: ['Apartment', 'Townhome', 'Condo'],
        maxPhotos: 22,
        maxDescriptionLength: 900,
        requiredFields: ['title', 'price', 'address', 'bedrooms', 'bathrooms'],
        optionalFields: ['amenities', 'petPolicy'],
        geographicCoverage: ['United States'],
        processingTime: '1 hour',
        autoRenewal: true,
        listingDuration: 60,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncFrequency: 'real_time'
      },
      {
        id: 'cozycozy_001',
        platform: 'cozycozy',
        displayName: 'CozyCozy',
        description: 'International rental search engine',
        websiteUrl: 'https://cozycozy.com',
        status: 'inactive',
        authenticationType: 'api_key',
        pricing: {
          id: 'cozycozy_pricing',
          platform: 'cozycozy',
          priceType: 'per_listing',
          basePrice: 13.99,
          currency: 'USD',
          bundleEligible: true,
          isActive: true,
          effectiveDate: new Date().toISOString()
        },
        features: ['International Reach', 'Multi-language Support', 'Currency Conversion'],
        supportedPropertyTypes: ['Apartment', 'House', 'Studio', 'Room'],
        maxPhotos: 16,
        maxDescriptionLength: 600,
        requiredFields: ['title', 'price', 'address'],
        optionalFields: ['amenities', 'utilities'],
        geographicCoverage: ['United States', 'Europe', 'Asia'],
        processingTime: '4 hours',
        autoRenewal: true,
        listingDuration: 90,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncFrequency: 'daily'
      },
      {
        id: 'doorsteps_001',
        platform: 'doorsteps',
        displayName: 'Doorsteps',
        description: 'Move.com powered rental platform',
        websiteUrl: 'https://doorsteps.com',
        status: 'inactive',
        authenticationType: 'oauth2',
        pricing: {
          id: 'doorsteps_pricing',
          platform: 'doorsteps',
          priceType: 'monthly_subscription',
          basePrice: 39.99,
          currency: 'USD',
          bundleEligible: true,
          isActive: true,
          effectiveDate: new Date().toISOString()
        },
        features: ['Move.com Integration', 'Professional Photography', 'Market Analytics'],
        supportedPropertyTypes: ['Apartment', 'House', 'Condo', 'Townhome'],
        maxPhotos: 28,
        maxDescriptionLength: 1100,
        requiredFields: ['title', 'price', 'address', 'bedrooms', 'bathrooms'],
        optionalFields: ['amenities', 'petPolicy', 'parking'],
        geographicCoverage: ['United States'],
        processingTime: '2-3 hours',
        autoRenewal: true,
        listingDuration: 75,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncFrequency: 'daily'
      }
    ];

    defaultPlatforms.forEach(config => {
      if (!this.platformConfigs.has(config.platform)) {
        this.platformConfigs.set(config.platform, config);
      }
    });
  }

  private loadPlatformConfigurations(): PlatformConfiguration[] {
    try {
      return LocalStorageService.getItem('real_estate_platform_configs', []);
    } catch (error) {
      console.error('Failed to load platform configurations:', error);
      return [];
    }
  }

  private savePlatformConfigurations(): void {
    try {
      const configs = Array.from(this.platformConfigs.values());
      LocalStorageService.setItem('real_estate_platform_configs', configs);
    } catch (error) {
      console.error('Failed to save platform configurations:', error);
    }
  }

  private loadAuthenticationStatus(): Map<RealEstatePlatform, boolean> {
    try {
      const authData = LocalStorageService.getItem('real_estate_auth_status', {});
      return new Map(Object.entries(authData) as [RealEstatePlatform, boolean][]);
    } catch (error) {
      console.error('Failed to load authentication status:', error);
      return new Map();
    }
  }

  private saveAuthenticationStatus(): void {
    try {
      const authObj = Object.fromEntries(this.authenticated);
      LocalStorageService.setItem('real_estate_auth_status', authObj);
    } catch (error) {
      console.error('Failed to save authentication status:', error);
    }
  }

  private logActivity(log: Omit<PlatformIntegrationLog, 'id' | 'timestamp'>): void {
    const logEntry: PlatformIntegrationLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...log
    };

    try {
      const logs = LocalStorageService.getItem('real_estate_integration_logs', []);
      logs.unshift(logEntry);
      
      // Keep only last 1000 logs
      if (logs.length > 1000) {
        logs.splice(1000);
      }
      
      LocalStorageService.setItem('real_estate_integration_logs', logs);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  /**
   * Get integration logs
   */
  getIntegrationLogs(limit: number = 50): PlatformIntegrationLog[] {
    try {
      const logs = LocalStorageService.getItem('real_estate_integration_logs', []);
      return logs.slice(0, limit);
    } catch (error) {
      console.error('Failed to get integration logs:', error);
      return [];
    }
  }
}

// Export singleton instance
export const RealEstatePlatformService = new RealEstatePlatformServiceClass();
export default RealEstatePlatformService;
