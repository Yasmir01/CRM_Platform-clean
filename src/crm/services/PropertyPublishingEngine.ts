/**
 * Property Publishing Engine
 * Handles publishing properties to multiple real estate platforms with platform-specific adapters
 */

import {
  RealEstatePlatform,
  PropertyListingData,
  PublishingResult,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  PlatformConfiguration,
  RealEstatePlatformService as ServiceInterface
} from '../types/RealEstatePlatformTypes';
<<<<<<< HEAD
=======
import { displayContactName } from '@/crm/utils/contactDisplay';
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
import { Property } from '../contexts/CrmDataContext';

// Platform-specific adapter interfaces
export interface PlatformAdapter {
  platform: RealEstatePlatform;
  validateListing(data: PropertyListingData): ValidationResult;
  transformListing(data: PropertyListingData): any;
  publishListing(transformedData: any, config: PlatformConfiguration): Promise<PublishingResult>;
  updateListing(externalId: string, data: PropertyListingData, config: PlatformConfiguration): Promise<PublishingResult>;
  removeListing(externalId: string, config: PlatformConfiguration): Promise<boolean>;
  getListingStatus(externalId: string, config: PlatformConfiguration): Promise<string>;
}

// Base adapter with common functionality
abstract class BasePlatformAdapter implements PlatformAdapter {
  abstract platform: RealEstatePlatform;

  validateListing(data: PropertyListingData): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Common validations
    if (!data.title || data.title.length < 10) {
      errors.push({ field: 'title', message: 'Title must be at least 10 characters', code: 'TITLE_TOO_SHORT' });
    }

    if (!data.description || data.description.length < 50) {
      errors.push({ field: 'description', message: 'Description must be at least 50 characters', code: 'DESCRIPTION_TOO_SHORT' });
    }

    if (data.price <= 0) {
      errors.push({ field: 'price', message: 'Price must be greater than 0', code: 'INVALID_PRICE' });
    }

    if (!data.address.street || !data.address.city || !data.address.state || !data.address.zipCode) {
      errors.push({ field: 'address', message: 'Complete address is required', code: 'INCOMPLETE_ADDRESS' });
    }

    if (data.details.bedrooms < 0 || data.details.bathrooms < 0) {
      errors.push({ field: 'details', message: 'Bedrooms and bathrooms must be non-negative', code: 'INVALID_ROOM_COUNT' });
    }

    if (data.media.photos.length === 0) {
      errors.push({ field: 'photos', message: 'At least one photo is required', code: 'NO_PHOTOS' });
    }

    // Warnings
    if (data.media.photos.length < 5) {
      warnings.push({ 
        field: 'photos', 
        message: 'Consider adding more photos for better visibility',
        suggestion: 'Upload 5-10 high-quality photos'
      });
    }

    if (data.description.length < 200) {
      warnings.push({ 
        field: 'description', 
        message: 'Longer descriptions typically perform better',
        suggestion: 'Aim for 200-500 characters with detailed amenities'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  abstract transformListing(data: PropertyListingData): any;
  abstract publishListing(transformedData: any, config: PlatformConfiguration): Promise<PublishingResult>;
  abstract updateListing(externalId: string, data: PropertyListingData, config: PlatformConfiguration): Promise<PublishingResult>;
  abstract removeListing(externalId: string, config: PlatformConfiguration): Promise<boolean>;
  abstract getListingStatus(externalId: string, config: PlatformConfiguration): Promise<string>;

  protected async makeApiCall(url: string, options: RequestInit, platform: RealEstatePlatform): Promise<any> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'PropertyCRM/1.0',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed for ${platform}:`, error);
      throw error;
    }
  }

  protected generateExternalId(platform: RealEstatePlatform): string {
    return `${platform}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }
}

// Zillow Adapter
class ZillowAdapter extends BasePlatformAdapter {
  platform: RealEstatePlatform = 'zillow';

  validateListing(data: PropertyListingData): ValidationResult {
    const baseValidation = super.validateListing(data);
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];

    // Zillow-specific validations
    if (data.title.length > 100) {
      errors.push({ field: 'title', message: 'Title cannot exceed 100 characters for Zillow', code: 'TITLE_TOO_LONG' });
    }

    if (data.description.length > 1000) {
      errors.push({ field: 'description', message: 'Description cannot exceed 1000 characters for Zillow', code: 'DESCRIPTION_TOO_LONG' });
    }

    if (data.media.photos.length > 50) {
      warnings.push({ 
        field: 'photos', 
        message: 'Zillow supports up to 50 photos',
        suggestion: 'Consider selecting your best 50 photos'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  transformListing(data: PropertyListingData): any {
    return {
      listingId: data.propertyId,
      address: {
        streetAddress: data.address.street,
        city: data.address.city,
        state: data.address.state,
        zipCode: data.address.zipCode,
        coordinates: data.address.coordinates
      },
      listingDetails: {
        price: data.price,
        priceType: data.priceType,
        propertyType: data.propertyType,
        bedrooms: data.details.bedrooms,
        bathrooms: data.details.bathrooms,
        squareFootage: data.details.squareFootage,
        description: data.description,
        amenities: data.details.amenities,
        petPolicy: data.details.petPolicy,
        parkingSpaces: data.details.parkingSpaces
      },
      media: {
        photos: data.media.photos.map(photo => ({
          url: photo.url,
          caption: photo.caption,
          isPrimary: photo.isPrimary,
          order: photo.order
        })),
        videos: data.media.videos,
        virtualTourUrl: data.media.virtualTour
      },
      availability: {
        availableDate: data.availability.availableDate,
        leaseDuration: data.availability.leaseDuration
      },
      contact: {
<<<<<<< HEAD
        agentName: data.contact.name,
=======
        agentName: displayContactName(data.contact),
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
        phone: data.contact.phone,
        email: data.contact.email
      }
    };
  }

  async publishListing(transformedData: any, config: PlatformConfiguration): Promise<PublishingResult> {
    try {
      // Simulate Zillow API call
      const apiUrl = config.apiEndpoints?.listingsUrl || 'https://api.zillow.com/listings';
      
      // In real implementation, this would be an actual API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      
      const externalId = this.generateExternalId('zillow');
      const listingUrl = `https://zillow.com/listing/${externalId}`;

      return {
        platform: 'zillow',
        status: 'published',
        externalListingId: externalId,
        listingUrl,
        publishedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        message: 'Successfully published to Zillow'
      };
    } catch (error) {
      return {
        platform: 'zillow',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to publish to Zillow'
      };
    }
  }

  async updateListing(externalId: string, data: PropertyListingData, config: PlatformConfiguration): Promise<PublishingResult> {
    try {
      const transformedData = this.transformListing(data);
      
      // Simulate update API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        platform: 'zillow',
        status: 'published',
        externalListingId: externalId,
        publishedAt: new Date().toISOString(),
        message: 'Successfully updated Zillow listing'
      };
    } catch (error) {
      return {
        platform: 'zillow',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to update Zillow listing'
      };
    }
  }

  async removeListing(externalId: string, config: PlatformConfiguration): Promise<boolean> {
    try {
      // Simulate removal API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return Math.random() > 0.1; // 90% success rate
    } catch (error) {
      console.error('Failed to remove Zillow listing:', error);
      return false;
    }
  }

  async getListingStatus(externalId: string, config: PlatformConfiguration): Promise<string> {
    try {
      // Simulate status check
      await new Promise(resolve => setTimeout(resolve, 500));
      const statuses = ['published', 'pending', 'expired', 'removed'];
      return statuses[Math.floor(Math.random() * statuses.length)];
    } catch (error) {
      return 'error';
    }
  }
}

// Apartments.com Adapter
class ApartmentsComAdapter extends BasePlatformAdapter {
  platform: RealEstatePlatform = 'apartments_com';

  validateListing(data: PropertyListingData): ValidationResult {
    const baseValidation = super.validateListing(data);
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];

    // Apartments.com-specific validations
    if (!data.details.squareFootage) {
      errors.push({ field: 'squareFootage', message: 'Square footage is required for Apartments.com', code: 'MISSING_SQFT' });
    }

    if (data.media.photos.length > 25) {
      warnings.push({ 
        field: 'photos', 
        message: 'Apartments.com supports up to 25 photos',
        suggestion: 'Select your best 25 photos'
      });
    }

    if (!data.details.amenities || data.details.amenities.length === 0) {
      warnings.push({ 
        field: 'amenities', 
        message: 'Adding amenities improves listing visibility',
        suggestion: 'Include amenities like parking, laundry, pool, etc.'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  transformListing(data: PropertyListingData): any {
    return {
      property: {
        address: `${data.address.street}, ${data.address.city}, ${data.address.state} ${data.address.zipCode}`,
        rent: data.price,
        rentType: data.priceType,
        propertyType: data.propertyType,
        bedrooms: data.details.bedrooms,
        bathrooms: data.details.bathrooms,
        squareFeet: data.details.squareFootage,
        description: data.description,
        amenities: data.details.amenities.join(', '),
        petPolicy: data.details.petPolicy,
        parking: data.details.parkingSpaces ? `${data.details.parkingSpaces} spaces` : 'Contact for details',
        availableDate: data.availability.availableDate,
        leaseLength: data.availability.leaseDuration
      },
      photos: data.media.photos.slice(0, 25).map((photo, index) => ({
        url: photo.url,
        caption: photo.caption || `Photo ${index + 1}`,
        isPrimary: photo.isPrimary
      })),
      contact: {
<<<<<<< HEAD
        name: data.contact.name,
=======
        name: displayContactName(data.contact),
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
        phone: data.contact.phone,
        email: data.contact.email,
        preferredContact: data.contact.preferredContact
      }
    };
  }

  async publishListing(transformedData: any, config: PlatformConfiguration): Promise<PublishingResult> {
    try {
      // Simulate Apartments.com API call
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      const externalId = this.generateExternalId('apartments_com');
      const listingUrl = `https://apartments.com/listing/${externalId}`;

      return {
        platform: 'apartments_com',
        status: 'published',
        externalListingId: externalId,
        listingUrl,
        publishedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
        message: 'Successfully published to Apartments.com'
      };
    } catch (error) {
      return {
        platform: 'apartments_com',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to publish to Apartments.com'
      };
    }
  }

  async updateListing(externalId: string, data: PropertyListingData, config: PlatformConfiguration): Promise<PublishingResult> {
    try {
      const transformedData = this.transformListing(data);
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      return {
        platform: 'apartments_com',
        status: 'published',
        externalListingId: externalId,
        publishedAt: new Date().toISOString(),
        message: 'Successfully updated Apartments.com listing'
      };
    } catch (error) {
      return {
        platform: 'apartments_com',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to update Apartments.com listing'
      };
    }
  }

  async removeListing(externalId: string, config: PlatformConfiguration): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      return Math.random() > 0.15; // 85% success rate
    } catch (error) {
      return false;
    }
  }

  async getListingStatus(externalId: string, config: PlatformConfiguration): Promise<string> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      const statuses = ['published', 'pending', 'expired', 'removed'];
      return statuses[Math.floor(Math.random() * statuses.length)];
    } catch (error) {
      return 'error';
    }
  }
}

// Craigslist Adapter
class CraigslistAdapter extends BasePlatformAdapter {
  platform: RealEstatePlatform = 'craigslist';

  validateListing(data: PropertyListingData): ValidationResult {
    const baseValidation = super.validateListing(data);
    const errors = [...baseValidation.errors];
    const warnings = [...baseValidation.warnings];

    // Craigslist-specific validations
    if (data.media.photos.length > 12) {
      warnings.push({ 
        field: 'photos', 
        message: 'Craigslist supports up to 12 photos',
        suggestion: 'Select your best 12 photos'
      });
    }

    if (data.description.length > 8000) {
      errors.push({ field: 'description', message: 'Description cannot exceed 8000 characters for Craigslist', code: 'DESCRIPTION_TOO_LONG' });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  transformListing(data: PropertyListingData): any {
    return {
      title: data.title,
      body: `${data.description}\n\nLocation: ${data.address.street}, ${data.address.city}, ${data.address.state} ${data.address.zipCode}\nRent: $${data.price}/${data.priceType}\nBedrooms: ${data.details.bedrooms}\nBathrooms: ${data.details.bathrooms}${data.details.squareFootage ? `\nSquare Footage: ${data.details.squareFootage} sq ft` : ''}\n\nAmenities: ${data.details.amenities.join(', ')}\n\nContact: ${data.contact.name} - ${data.contact.phone}`,
      price: data.price,
      location: {
        area: data.address.city,
        region: data.address.state,
        postal_code: data.address.zipCode
      },
      housing: {
        bedrooms: data.details.bedrooms,
        bathrooms: data.details.bathrooms,
        sqft: data.details.squareFootage,
        pets_ok: data.details.petPolicy?.toLowerCase().includes('allowed'),
        parking: data.details.parkingSpaces
      },
      images: data.media.photos.slice(0, 12).map(photo => photo.url),
      contact_info: {
<<<<<<< HEAD
        name: data.contact.name,
=======
        name: displayContactName(data.contact),
>>>>>>> ac4b396533b24013bc1866988c2033005cd609c9
        phone: data.contact.phone,
        email: data.contact.email
      }
    };
  }

  async publishListing(transformedData: any, config: PlatformConfiguration): Promise<PublishingResult> {
    try {
      // Simulate Craigslist posting (typically done via automation/scraping)
      await new Promise(resolve => setTimeout(resolve, 3000)); // Longer delay for scraping simulation
      
      const externalId = this.generateExternalId('craigslist');
      const listingUrl = `https://craigslist.org/listing/${externalId}`;

      return {
        platform: 'craigslist',
        status: 'published',
        externalListingId: externalId,
        listingUrl,
        publishedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        message: 'Successfully published to Craigslist'
      };
    } catch (error) {
      return {
        platform: 'craigslist',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to publish to Craigslist'
      };
    }
  }

  async updateListing(externalId: string, data: PropertyListingData, config: PlatformConfiguration): Promise<PublishingResult> {
    try {
      // Craigslist typically requires reposting for updates
      const result = await this.publishListing(this.transformListing(data), config);
      return {
        ...result,
        message: 'Listing reposted on Craigslist (updates require reposting)'
      };
    } catch (error) {
      return {
        platform: 'craigslist',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to update Craigslist listing'
      };
    }
  }

  async removeListing(externalId: string, config: PlatformConfiguration): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return Math.random() > 0.2; // 80% success rate (manual removal challenges)
    } catch (error) {
      return false;
    }
  }

  async getListingStatus(externalId: string, config: PlatformConfiguration): Promise<string> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const statuses = ['published', 'expired', 'removed', 'flagged'];
      return statuses[Math.floor(Math.random() * statuses.length)];
    } catch (error) {
      return 'error';
    }
  }
}

// Generic Adapter for other platforms
class GenericPlatformAdapter extends BasePlatformAdapter {
  constructor(public platform: RealEstatePlatform) {
    super();
  }

  transformListing(data: PropertyListingData): any {
    return {
      id: data.propertyId,
      title: data.title,
      description: data.description,
      price: data.price,
      address: data.address,
      details: data.details,
      media: data.media,
      availability: data.availability,
      contact: data.contact
    };
  }

  async publishListing(transformedData: any, config: PlatformConfiguration): Promise<PublishingResult> {
    try {
      // Generic publishing simulation
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
      
      const externalId = this.generateExternalId(this.platform);
      const listingUrl = `https://${this.platform}.com/listing/${externalId}`;

      return {
        platform: this.platform,
        status: 'published',
        externalListingId: externalId,
        listingUrl,
        publishedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        message: `Successfully published to ${this.platform}`
      };
    } catch (error) {
      return {
        platform: this.platform,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to publish to ${this.platform}`
      };
    }
  }

  async updateListing(externalId: string, data: PropertyListingData, config: PlatformConfiguration): Promise<PublishingResult> {
    try {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 500));
      
      return {
        platform: this.platform,
        status: 'published',
        externalListingId: externalId,
        publishedAt: new Date().toISOString(),
        message: `Successfully updated ${this.platform} listing`
      };
    } catch (error) {
      return {
        platform: this.platform,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to update ${this.platform} listing`
      };
    }
  }

  async removeListing(externalId: string, config: PlatformConfiguration): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      return Math.random() > 0.1; // 90% success rate
    } catch (error) {
      return false;
    }
  }

  async getListingStatus(externalId: string, config: PlatformConfiguration): Promise<string> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const statuses = ['published', 'pending', 'expired', 'removed'];
      return statuses[Math.floor(Math.random() * statuses.length)];
    } catch (error) {
      return 'error';
    }
  }
}

// Publishing Engine
class PropertyPublishingEngineClass {
  private adapters: Map<RealEstatePlatform, PlatformAdapter> = new Map();

  constructor() {
    this.initializeAdapters();
  }

  private initializeAdapters(): void {
    // Specialized adapters
    this.adapters.set('zillow', new ZillowAdapter());
    this.adapters.set('apartments_com', new ApartmentsComAdapter());
    this.adapters.set('craigslist', new CraigslistAdapter());

    // Generic adapters for other platforms
    const genericPlatforms: RealEstatePlatform[] = [
      'realtors_com', 'trulia', 'rentberry', 'dwellsy', 'zumper',
      'rent_jungle', 'rentprep', 'move_com', 'rentdigs', 'apartment_list',
      'cozycozy', 'doorsteps'
    ];

    genericPlatforms.forEach(platform => {
      this.adapters.set(platform, new GenericPlatformAdapter(platform));
    });
  }

  /**
   * Convert CRM Property to PropertyListingData
   */
  convertPropertyToListingData(property: Property, contactInfo: any): PropertyListingData {
    return {
      propertyId: property.id,
      platform: 'zillow', // Will be set by individual adapters
      title: `${property.name} - ${property.type} for Rent`,
      description: property.description || `Beautiful ${property.type.toLowerCase()} available for rent in ${property.address}. Features ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms${property.squareFootage ? `, ${property.squareFootage} sq ft` : ''}. ${property.amenities ? 'Amenities include: ' + property.amenities.join(', ') + '.' : ''}`,
      price: property.monthlyRent,
      priceType: 'monthly',
      propertyType: property.type,
      address: {
        street: property.address.split(',')[0] || property.address,
        city: property.address.split(',')[1]?.trim() || 'City',
        state: property.address.split(',')[2]?.trim() || 'State',
        zipCode: property.address.split(',')[3]?.trim() || '00000',
        country: 'USA'
      },
      details: {
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        squareFootage: property.squareFootage,
        petPolicy: property.petPolicy || 'Contact for pet policy',
        parkingSpaces: property.parkingSpaces || 0,
        amenities: property.amenities || [],
        utilities: [],
        leaseTerms: []
      },
      media: {
        photos: property.images?.map(img => ({
          id: img.id,
          url: img.url,
          caption: img.alt,
          order: img.order,
          isPrimary: img.isMain
        })) || [],
        videos: [],
        virtualTour: undefined
      },
      availability: {
        availableDate: new Date().toISOString().split('T')[0],
        leaseDuration: '12 months',
        minimumStay: 12,
        maximumStay: 24
      },
      contact: {
        name: contactInfo.name || 'Property Manager',
        phone: contactInfo.phone || '(555) 000-0000',
        email: contactInfo.email || 'contact@property.com',
        preferredContact: 'phone'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Validate listing for specific platform
   */
  validateListing(platform: RealEstatePlatform, data: PropertyListingData): ValidationResult {
    const adapter = this.adapters.get(platform);
    if (!adapter) {
      return {
        isValid: false,
        errors: [{ field: 'platform', message: `Adapter not found for platform: ${platform}`, code: 'ADAPTER_NOT_FOUND' }],
        warnings: []
      };
    }

    return adapter.validateListing(data);
  }

  /**
   * Validate listing for multiple platforms
   */
  validateListingForPlatforms(platforms: RealEstatePlatform[], data: PropertyListingData): Record<RealEstatePlatform, ValidationResult> {
    const results: Record<string, ValidationResult> = {};
    
    platforms.forEach(platform => {
      results[platform] = this.validateListing(platform, data);
    });

    return results as Record<RealEstatePlatform, ValidationResult>;
  }

  /**
   * Publish listing to specific platform
   */
  async publishToPlatform(
    platform: RealEstatePlatform, 
    data: PropertyListingData, 
    config: PlatformConfiguration
  ): Promise<PublishingResult> {
    const adapter = this.adapters.get(platform);
    if (!adapter) {
      return {
        platform,
        status: 'failed',
        error: `Adapter not found for platform: ${platform}`,
        message: 'Platform adapter not available'
      };
    }

    // Validate first
    const validation = adapter.validateListing(data);
    if (!validation.isValid) {
      return {
        platform,
        status: 'failed',
        error: validation.errors.map(e => e.message).join(', '),
        message: 'Validation failed'
      };
    }

    // Transform and publish
    try {
      const transformedData = adapter.transformListing(data);
      return await adapter.publishListing(transformedData, config);
    } catch (error) {
      return {
        platform,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Publishing failed'
      };
    }
  }

  /**
   * Update listing on specific platform
   */
  async updateListingOnPlatform(
    platform: RealEstatePlatform,
    externalId: string,
    data: PropertyListingData,
    config: PlatformConfiguration
  ): Promise<PublishingResult> {
    const adapter = this.adapters.get(platform);
    if (!adapter) {
      return {
        platform,
        status: 'failed',
        error: `Adapter not found for platform: ${platform}`,
        message: 'Platform adapter not available'
      };
    }

    return await adapter.updateListing(externalId, data, config);
  }

  /**
   * Remove listing from specific platform
   */
  async removeListingFromPlatform(
    platform: RealEstatePlatform,
    externalId: string,
    config: PlatformConfiguration
  ): Promise<boolean> {
    const adapter = this.adapters.get(platform);
    if (!adapter) {
      return false;
    }

    return await adapter.removeListing(externalId, config);
  }

  /**
   * Get listing status from specific platform
   */
  async getListingStatusFromPlatform(
    platform: RealEstatePlatform,
    externalId: string,
    config: PlatformConfiguration
  ): Promise<string> {
    const adapter = this.adapters.get(platform);
    if (!adapter) {
      return 'error';
    }

    return await adapter.getListingStatus(externalId, config);
  }

  /**
   * Get supported platforms
   */
  getSupportedPlatforms(): RealEstatePlatform[] {
    return Array.from(this.adapters.keys());
  }
}

// Export singleton instance
export const PropertyPublishingEngine = new PropertyPublishingEngineClass();
export default PropertyPublishingEngine;
