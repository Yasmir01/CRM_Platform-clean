/**
 * Listing Publishing Service
 * High-level service for publishing properties from CRM to real estate platforms
 */

import { PlatformConnectionService } from './PlatformConnectionService';
import { LocalStorageService } from './LocalStorageService';
import {
  RealEstatePlatform,
  PublishingJob,
  PublishingResult,
  PropertyListingData
} from '../types/RealEstatePlatformTypes';

interface PublishingTemplate {
  id: string;
  name: string;
  description: string;
  platforms: RealEstatePlatform[];
  isDefault: boolean;
  settings: {
    autoPublish: boolean;
    schedulePublish?: string;
    notifyOnCompletion: boolean;
    retryFailures: boolean;
    maxRetries: number;
  };
  fieldMappings: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

interface PublishingSchedule {
  id: string;
  propertyId: string;
  platforms: RealEstatePlatform[];
  scheduledAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

interface PublishingStats {
  totalPublications: number;
  successfulPublications: number;
  failedPublications: number;
  successRate: number;
  platformBreakdown: Record<RealEstatePlatform, {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
  }>;
  recentJobs: PublishingJob[];
}

class ListingPublishingServiceClass {
  private isInitialized = false;

  /**
   * Initialize the publishing service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize the platform connection service
      await PlatformConnectionService.initialize();

      // Initialize default templates if none exist
      this.initializeDefaultTemplates();

      this.isInitialized = true;
      console.log('ListingPublishingService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ListingPublishingService:', error);
      throw error;
    }
  }

  /**
   * Publish a property to selected platforms
   */
  async publishProperty(
    property: any,
    platforms: RealEstatePlatform[],
    options: {
      userId: string;
      template?: string;
      validateOnly?: boolean;
      scheduleFor?: string;
      retryFailures?: boolean;
    }
  ): Promise<{
    success: boolean;
    jobId?: string;
    validationErrors?: string[];
    results?: PublishingResult[];
    message: string;
  }> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Validate property data
      const validation = this.validatePropertyData(property, platforms);
      if (!validation.valid) {
        return {
          success: false,
          validationErrors: validation.errors,
          message: `Validation failed: ${validation.errors.join(', ')}`
        };
      }

      // If validation only, return success
      if (options.validateOnly) {
        return {
          success: true,
          message: 'Property data validation passed'
        };
      }

      // Check if scheduling is requested
      if (options.scheduleFor) {
        const scheduleId = await this.schedulePublication(property.id, platforms, options.scheduleFor);
        return {
          success: true,
          jobId: scheduleId,
          message: `Publication scheduled for ${options.scheduleFor}`
        };
      }

      // Apply template if specified
      let processedProperty = property;
      if (options.template) {
        const template = this.getTemplate(options.template);
        if (template) {
          processedProperty = this.applyTemplate(property, template);
          platforms = template.platforms.length > 0 ? template.platforms : platforms;
        }
      }

      // Publish immediately
      const result = await PlatformConnectionService.publishListing(
        processedProperty,
        platforms,
        options.userId
      );

      // Handle retry logic if enabled
      if (options.retryFailures && result.failureCount > 0) {
        await this.scheduleRetries(result.jobId, result.results, options.userId);
      }

      return {
        success: result.successCount > 0,
        jobId: result.jobId,
        results: result.results,
        message: `Published to ${result.successCount}/${platforms.length} platforms successfully`
      };

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Publishing failed:', error);
      
      return {
        success: false,
        message: `Publishing failed: ${message}`
      };
    }
  }

  /**
   * Batch publish multiple properties
   */
  async batchPublishProperties(
    properties: any[],
    platforms: RealEstatePlatform[],
    options: {
      userId: string;
      template?: string;
      batchSize?: number;
      delayBetweenBatches?: number;
    }
  ): Promise<{
    success: boolean;
    totalProperties: number;
    successfulProperties: number;
    failedProperties: number;
    jobIds: string[];
    summary: string;
  }> {
    const batchSize = options.batchSize || 5;
    const delay = options.delayBetweenBatches || 2000;
    const jobIds: string[] = [];
    let successfulProperties = 0;
    let failedProperties = 0;

    // Process properties in batches
    for (let i = 0; i < properties.length; i += batchSize) {
      const batch = properties.slice(i, i + batchSize);
      
      // Process current batch
      const batchPromises = batch.map(property => 
        this.publishProperty(property, platforms, {
          userId: options.userId,
          template: options.template
        })
      );

      const batchResults = await Promise.allSettled(batchPromises);

      // Process batch results
      batchResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value.success) {
          successfulProperties++;
          if (result.value.jobId) {
            jobIds.push(result.value.jobId);
          }
        } else {
          failedProperties++;
        }
      });

      // Add delay between batches (except for last batch)
      if (i + batchSize < properties.length) {
        await this.delay(delay);
      }
    }

    return {
      success: successfulProperties > 0,
      totalProperties: properties.length,
      successfulProperties,
      failedProperties,
      jobIds,
      summary: `Batch publishing completed: ${successfulProperties}/${properties.length} properties published successfully`
    };
  }

  /**
   * Update listing on platforms
   */
  async updateListing(
    property: any,
    platforms: RealEstatePlatform[],
    userId: string
  ): Promise<{
    success: boolean;
    results: Array<{
      platform: RealEstatePlatform;
      success: boolean;
      message: string;
    }>;
  }> {
    const results: Array<{
      platform: RealEstatePlatform;
      success: boolean;
      message: string;
    }> = [];

    // Get existing external listing IDs for this property
    const externalListings = this.getExternalListings(property.id);

    for (const platform of platforms) {
      const externalListing = externalListings.find(listing => listing.platform === platform);
      
      if (!externalListing) {
        results.push({
          platform,
          success: false,
          message: 'No existing listing found on this platform'
        });
        continue;
      }

      try {
        const result = await PlatformConnectionService.updateListing(
          externalListing.externalId,
          platform,
          property,
          userId
        );

        results.push({
          platform,
          success: result.success,
          message: result.message
        });

      } catch (error) {
        results.push({
          platform,
          success: false,
          message: error instanceof Error ? error.message : 'Update failed'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return {
      success: successCount > 0,
      results
    };
  }

  /**
   * Remove listing from platforms
   */
  async removeListing(
    propertyId: string,
    platforms: RealEstatePlatform[],
    userId: string
  ): Promise<{
    success: boolean;
    results: Array<{
      platform: RealEstatePlatform;
      success: boolean;
      message: string;
    }>;
  }> {
    const results: Array<{
      platform: RealEstatePlatform;
      success: boolean;
      message: string;
    }> = [];

    // Get existing external listing IDs for this property
    const externalListings = this.getExternalListings(propertyId);

    for (const platform of platforms) {
      const externalListing = externalListings.find(listing => listing.platform === platform);
      
      if (!externalListing) {
        results.push({
          platform,
          success: false,
          message: 'No existing listing found on this platform'
        });
        continue;
      }

      try {
        const result = await PlatformConnectionService.removeListing(
          externalListing.externalId,
          platform,
          userId
        );

        results.push({
          platform,
          success: result.success,
          message: result.message
        });

        // Remove from stored external listings if successful
        if (result.success) {
          this.removeExternalListing(propertyId, platform);
        }

      } catch (error) {
        results.push({
          platform,
          success: false,
          message: error instanceof Error ? error.message : 'Removal failed'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return {
      success: successCount > 0,
      results
    };
  }

  /**
   * Get publishing statistics
   */
  getPublishingStats(timeframe: 'day' | 'week' | 'month' | 'year' = 'month'): PublishingStats {
    const jobs = this.getPublishingJobs();
    const cutoffDate = this.getCutoffDate(timeframe);
    const recentJobs = jobs.filter(job => new Date(job.submittedAt) >= cutoffDate);

    const totalPublications = recentJobs.reduce((sum, job) => sum + job.totalPlatforms, 0);
    const successfulPublications = recentJobs.reduce((sum, job) => sum + job.successfulPlatforms, 0);
    const failedPublications = recentJobs.reduce((sum, job) => sum + job.failedPlatforms, 0);
    const successRate = totalPublications > 0 ? (successfulPublications / totalPublications) * 100 : 0;

    // Calculate platform breakdown
    const platformBreakdown: Record<string, any> = {};
    const supportedPlatforms = PlatformConnectionService.getSupportedPlatforms();

    supportedPlatforms.forEach(platform => {
      const platformJobs = recentJobs.filter(job => job.platforms.includes(platform));
      const total = platformJobs.length;
      const successful = platformJobs.filter(job => 
        job.results.some(result => result.platform === platform && result.status === 'published')
      ).length;
      const failed = total - successful;

      platformBreakdown[platform] = {
        total,
        successful,
        failed,
        successRate: total > 0 ? (successful / total) * 100 : 0
      };
    });

    return {
      totalPublications,
      successfulPublications,
      failedPublications,
      successRate,
      platformBreakdown: platformBreakdown as any,
      recentJobs: recentJobs.slice(0, 10) // Last 10 jobs
    };
  }

  /**
   * Create publishing template
   */
  createTemplate(template: Omit<PublishingTemplate, 'id' | 'createdAt' | 'updatedAt'>): string {
    const templateId = `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    const newTemplate: PublishingTemplate = {
      ...template,
      id: templateId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const templates = this.getTemplates();
    templates.push(newTemplate);
    LocalStorageService.setItem('publishing_templates', templates);

    return templateId;
  }

  /**
   * Get all publishing templates
   */
  getTemplates(): PublishingTemplate[] {
    return LocalStorageService.getItem('publishing_templates', []);
  }

  /**
   * Get specific template
   */
  getTemplate(templateId: string): PublishingTemplate | null {
    const templates = this.getTemplates();
    return templates.find(t => t.id === templateId) || null;
  }

  /**
   * Update publishing template
   */
  updateTemplate(templateId: string, updates: Partial<PublishingTemplate>): boolean {
    const templates = this.getTemplates();
    const index = templates.findIndex(t => t.id === templateId);
    
    if (index === -1) return false;

    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    LocalStorageService.setItem('publishing_templates', templates);
    return true;
  }

  /**
   * Delete publishing template
   */
  deleteTemplate(templateId: string): boolean {
    const templates = this.getTemplates();
    const filteredTemplates = templates.filter(t => t.id !== templateId);
    
    if (filteredTemplates.length === templates.length) return false;

    LocalStorageService.setItem('publishing_templates', filteredTemplates);
    return true;
  }

  /**
   * Get publishing jobs
   */
  getPublishingJobs(): PublishingJob[] {
    return LocalStorageService.getItem('publishing_jobs', []);
  }

  /**
   * Get publishing job by ID
   */
  getPublishingJob(jobId: string): PublishingJob | null {
    const jobs = this.getPublishingJobs();
    return jobs.find(job => job.id === jobId) || null;
  }

  /**
   * Get property publishing history
   */
  getPropertyPublishingHistory(propertyId: string): PublishingJob[] {
    const jobs = this.getPublishingJobs();
    return jobs.filter(job => job.propertyId === propertyId)
              .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  /**
   * Check if property is published to platform
   */
  isPropertyPublished(propertyId: string, platform: RealEstatePlatform): boolean {
    const externalListings = this.getExternalListings(propertyId);
    return externalListings.some(listing => listing.platform === platform);
  }

  /**
   * Get external listing info
   */
  getExternalListingInfo(propertyId: string, platform: RealEstatePlatform): {
    externalId: string;
    listingUrl: string;
    publishedAt: string;
  } | null {
    const externalListings = this.getExternalListings(propertyId);
    const listing = externalListings.find(l => l.platform === platform);
    return listing ? {
      externalId: listing.externalId,
      listingUrl: listing.listingUrl,
      publishedAt: listing.publishedAt
    } : null;
  }

  // Private methods

  private initializeDefaultTemplates(): void {
    const existingTemplates = this.getTemplates();
    
    if (existingTemplates.length === 0) {
      // Create default templates
      const defaultTemplates: Array<Omit<PublishingTemplate, 'id' | 'createdAt' | 'updatedAt'>> = [
        {
          name: 'All Platforms',
          description: 'Publish to all available platforms',
          platforms: PlatformConnectionService.getSupportedPlatforms(),
          isDefault: true,
          settings: {
            autoPublish: false,
            notifyOnCompletion: true,
            retryFailures: true,
            maxRetries: 3
          },
          fieldMappings: {}
        },
        {
          name: 'Major Platforms Only',
          description: 'Publish to major platforms (Zillow, Apartments.com, Trulia)',
          platforms: ['zillow', 'apartments_com', 'trulia'],
          isDefault: false,
          settings: {
            autoPublish: false,
            notifyOnCompletion: true,
            retryFailures: true,
            maxRetries: 2
          },
          fieldMappings: {}
        },
        {
          name: 'Free Platforms',
          description: 'Publish to free platforms only',
          platforms: ['craigslist'],
          isDefault: false,
          settings: {
            autoPublish: true,
            notifyOnCompletion: false,
            retryFailures: false,
            maxRetries: 1
          },
          fieldMappings: {}
        }
      ];

      defaultTemplates.forEach(template => this.createTemplate(template));
    }
  }

  private validatePropertyData(property: any, platforms: RealEstatePlatform[]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Basic required fields
    if (!property.name && !property.title) {
      errors.push('Property name/title is required');
    }

    if (!property.address) {
      errors.push('Property address is required');
    }

    if (!property.monthlyRent && !property.price) {
      errors.push('Property rent/price is required');
    }

    // Platform-specific validation
    for (const platform of platforms) {
      const adapter = PlatformConnectionService.getPlatformAdapter(platform);
      if (adapter) {
        const transformedData = adapter.transformPropertyData(property);
        const validation = adapter.validateListingData(transformedData);
        
        if (!validation.valid) {
          errors.push(`${platform}: ${validation.errors.join(', ')}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private applyTemplate(property: any, template: PublishingTemplate): any {
    // Apply field mappings and template settings
    let processedProperty = { ...property };

    // Apply field mappings
    Object.entries(template.fieldMappings).forEach(([sourceField, targetField]) => {
      if (property[sourceField] && !property[targetField]) {
        processedProperty[targetField] = property[sourceField];
      }
    });

    return processedProperty;
  }

  private async schedulePublication(
    propertyId: string,
    platforms: RealEstatePlatform[],
    scheduledAt: string
  ): Promise<string> {
    const scheduleId = `sch_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    const schedule: PublishingSchedule = {
      id: scheduleId,
      propertyId,
      platforms,
      scheduledAt,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const schedules = LocalStorageService.getItem('publishing_schedules', []);
    schedules.push(schedule);
    LocalStorageService.setItem('publishing_schedules', schedules);

    return scheduleId;
  }

  private async scheduleRetries(
    jobId: string,
    results: PublishingResult[],
    userId: string
  ): Promise<void> {
    const failedResults = results.filter(result => result.status === 'failed');
    
    if (failedResults.length === 0) return;

    // Schedule retries with exponential backoff
    const retryDelay = 5 * 60 * 1000; // 5 minutes
    const retryAt = new Date(Date.now() + retryDelay).toISOString();

    // Store retry information
    const retries = LocalStorageService.getItem('publishing_retries', []);
    retries.push({
      originalJobId: jobId,
      retryAt,
      platforms: failedResults.map(r => r.platform),
      userId,
      attempt: 1
    });
    LocalStorageService.setItem('publishing_retries', retries);
  }

  private getExternalListings(propertyId: string): Array<{
    platform: RealEstatePlatform;
    externalId: string;
    listingUrl: string;
    publishedAt: string;
  }> {
    const allListings = LocalStorageService.getItem('external_listings', []);
    return allListings.filter((listing: any) => listing.propertyId === propertyId);
  }

  private removeExternalListing(propertyId: string, platform: RealEstatePlatform): void {
    const allListings = LocalStorageService.getItem('external_listings', []);
    const filteredListings = allListings.filter(
      (listing: any) => !(listing.propertyId === propertyId && listing.platform === platform)
    );
    LocalStorageService.setItem('external_listings', filteredListings);
  }

  private getCutoffDate(timeframe: 'day' | 'week' | 'month' | 'year'): Date {
    const now = new Date();
    const cutoff = new Date(now);

    switch (timeframe) {
      case 'day':
        cutoff.setDate(now.getDate() - 1);
        break;
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
    }

    return cutoff;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const ListingPublishingService = new ListingPublishingServiceClass();
export default ListingPublishingService;
