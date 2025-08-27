/**
 * Real Estate Platform Integration Types
 * Comprehensive types for integrating with 13+ real estate platforms
 */

export type RealEstatePlatform = 
  | 'zillow'
  | 'realtors_com'
  | 'apartments_com'
  | 'craigslist'
  | 'trulia'
  | 'rentberry'
  | 'dwellsy'
  | 'zumper'
  | 'rent_jungle'
  | 'rentprep'
  | 'move_com'
  | 'rentdigs'
  | 'apartment_list'
  | 'cozycozy'
  | 'doorsteps';

export type AuthenticationType = 
  | 'oauth2'
  | 'api_key'
  | 'username_password'
  | 'token_based'
  | 'scraping_based';

export type PlatformStatus = 
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'error'
  | 'pending_setup'
  | 'requires_auth';

export type PublishingStatus = 
  | 'published'
  | 'draft'
  | 'pending'
  | 'failed'
  | 'expired'
  | 'removed';

export interface PlatformConfiguration {
  id: string;
  platform: RealEstatePlatform;
  displayName: string;
  description: string;
  websiteUrl: string;
  status: PlatformStatus;
  authenticationType: AuthenticationType;
  authConfig?: PlatformAuthConfig;
  apiEndpoints?: PlatformApiEndpoints;
  pricing: PlatformPricing;
  features: string[];
  supportedPropertyTypes: string[];
  maxPhotos: number;
  maxDescriptionLength: number;
  requiredFields: string[];
  optionalFields: string[];
  geographicCoverage: string[];
  processingTime: string; // e.g., "Immediate", "1-2 hours", "24 hours"
  autoRenewal: boolean;
  listingDuration: number; // days
  createdAt: string;
  updatedAt: string;
  lastSync?: string;
  syncFrequency: 'real_time' | 'hourly' | 'daily' | 'manual';
}

export interface PlatformAuthConfig {
  clientId?: string;
  clientSecret?: string;
  apiKey?: string;
  apiSecret?: string;
  username?: string;
  password?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  scopes?: string[];
  webhookUrl?: string;
  redirectUri?: string;
  environment: 'sandbox' | 'production';
}

export interface PlatformApiEndpoints {
  baseUrl: string;
  authUrl?: string;
  listingsUrl: string;
  mediaUploadUrl?: string;
  webhookUrl?: string;
  statusUrl?: string;
}

export interface PlatformPricing {
  id: string;
  platform: RealEstatePlatform;
  priceType: 'per_listing' | 'monthly_subscription' | 'credit_based' | 'revenue_share';
  basePrice: number;
  currency: 'USD';
  additionalFees?: {
    featured_listing?: number;
    premium_placement?: number;
    photo_upgrade?: number;
    video_addon?: number;
  };
  bundleEligible: boolean;
  discountPercentage?: number; // When part of bundle
  isActive: boolean;
  effectiveDate: string;
  expirationDate?: string;
}

export interface PropertyListingData {
  propertyId: string;
  platform: RealEstatePlatform;
  externalListingId?: string;
  title: string;
  description: string;
  price: number;
  priceType: 'monthly' | 'weekly' | 'nightly';
  propertyType: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  details: {
    bedrooms: number;
    bathrooms: number;
    squareFootage?: number;
    petPolicy?: string;
    parkingSpaces?: number;
    amenities: string[];
    utilities?: string[];
    leaseTerms?: string[];
  };
  media: {
    photos: PropertyPhoto[];
    videos?: PropertyVideo[];
    virtualTour?: string;
  };
  availability: {
    availableDate: string;
    leaseDuration?: string;
    minimumStay?: number;
    maximumStay?: number;
  };
  contact: {
    name: string;
    phone: string;
    email: string;
    preferredContact: 'phone' | 'email' | 'text';
  };
  platformSpecific?: Record<string, any>; // Platform-specific fields
  createdAt: string;
  updatedAt: string;
}

export interface PropertyPhoto {
  id: string;
  url: string;
  caption?: string;
  order: number;
  isPrimary: boolean;
  platformUrls?: Record<RealEstatePlatform, string>; // Different URLs per platform
}

export interface PropertyVideo {
  id: string;
  url: string;
  title?: string;
  duration?: number;
  thumbnailUrl?: string;
  platformUrls?: Record<RealEstatePlatform, string>;
}

export interface PublishingJob {
  id: string;
  propertyId: string;
  platforms: RealEstatePlatform[];
  status: PublishingStatus;
  submittedAt: string;
  completedAt?: string;
  results: PublishingResult[];
  totalPlatforms: number;
  successfulPlatforms: number;
  failedPlatforms: number;
  errors?: PublishingError[];
}

export interface PublishingResult {
  platform: RealEstatePlatform;
  status: PublishingStatus;
  externalListingId?: string;
  listingUrl?: string;
  publishedAt?: string;
  expiresAt?: string;
  message?: string;
  error?: string;
}

export interface PublishingError {
  platform: RealEstatePlatform;
  code: string;
  message: string;
  field?: string;
  timestamp: string;
}

export interface PlatformBundle {
  id: string;
  name: string;
  description: string;
  platforms: RealEstatePlatform[];
  discountPercentage: number;
  totalPrice: number;
  originalPrice: number;
  isActive: boolean;
  isPopular?: boolean;
  features: string[];
  maxListings?: number;
  validityPeriod: number; // days
  createdAt: string;
  updatedAt: string;
}

export interface SuperAdminPlatformSettings {
  platformId: string;
  platform: RealEstatePlatform;
  isEnabled: boolean;
  isVisible: boolean; // Show to users
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  autoRetry: boolean;
  maxRetries: number;
  retryDelay: number; // seconds
  alertThresholds: {
    errorRate: number; // percentage
    responseTime: number; // milliseconds
    failedRequests: number;
  };
  adminNotes?: string;
  lastModifiedBy: string;
  lastModifiedAt: string;
}

export interface PlatformAnalytics {
  platform: RealEstatePlatform;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  metrics: {
    totalListings: number;
    activeListings: number;
    successfulPublications: number;
    failedPublications: number;
    totalViews: number;
    totalInquiries: number;
    conversionRate: number;
    averageTimeToPublish: number; // minutes
    revenue: number;
    costs: number;
    profit: number;
  };
  topPerformingListings: {
    propertyId: string;
    title: string;
    views: number;
    inquiries: number;
    revenue: number;
  }[];
}

export interface PlatformIntegrationLog {
  id: string;
  platform: RealEstatePlatform;
  action: 'publish' | 'update' | 'remove' | 'sync' | 'auth' | 'error';
  propertyId?: string;
  status: 'success' | 'failure' | 'warning';
  message: string;
  details?: Record<string, any>;
  duration?: number; // milliseconds
  timestamp: string;
  userId: string;
  userEmail: string;
}

// Platform-specific configuration interfaces
export interface ZillowConfig extends PlatformConfiguration {
  platform: 'zillow';
  authConfig: PlatformAuthConfig & {
    zwsId?: string; // Zillow Web Services ID
    premierId?: string;
  };
}

export interface CraigslistConfig extends PlatformConfiguration {
  platform: 'craigslist';
  authConfig: PlatformAuthConfig & {
    accountEmail: string;
    accountPassword: string;
    preferredAreas: string[];
  };
}

export interface ApartmentsComConfig extends PlatformConfiguration {
  platform: 'apartments_com';
  authConfig: PlatformAuthConfig & {
    partnerId?: string;
    feedType?: 'xml' | 'json';
  };
}

// Utility types
export type PlatformConfigByType<T extends RealEstatePlatform> = 
  T extends 'zillow' ? ZillowConfig :
  T extends 'craigslist' ? CraigslistConfig :
  T extends 'apartments_com' ? ApartmentsComConfig :
  PlatformConfiguration;

export interface RealEstatePlatformService {
  initialize(config: PlatformConfiguration): Promise<boolean>;
  authenticate(): Promise<boolean>;
  publishListing(data: PropertyListingData): Promise<PublishingResult>;
  updateListing(externalId: string, data: Partial<PropertyListingData>): Promise<PublishingResult>;
  removeListing(externalId: string): Promise<boolean>;
  getListingStatus(externalId: string): Promise<PublishingStatus>;
  uploadMedia(media: PropertyPhoto[] | PropertyVideo[]): Promise<string[]>;
  validateListingData(data: PropertyListingData): ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}
