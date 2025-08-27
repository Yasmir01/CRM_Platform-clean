/**
 * Platform Bundle Management Service
 * Handles pricing, bundles, and billing for real estate platform integrations
 */

import { LocalStorageService } from './LocalStorageService';
import {
  RealEstatePlatform,
  PlatformBundle,
  PlatformPricing,
  PlatformConfiguration
} from '../types/RealEstatePlatformTypes';

export interface UserSubscription {
  id: string;
  userId: string;
  type: 'individual' | 'bundle';
  platformId?: string; // For individual subscriptions
  bundleId?: string; // For bundle subscriptions
  status: 'active' | 'inactive' | 'suspended' | 'expired';
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  totalPrice: number;
  discountApplied?: number;
  paymentFrequency: 'monthly' | 'quarterly' | 'yearly';
  remainingListings?: number; // For credit-based subscriptions
  usedListings?: number;
  createdAt: string;
  updatedAt: string;
  lastBillingDate?: string;
  nextBillingDate?: string;
}

export interface BundleUsageStats {
  bundleId: string;
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  averageUsage: number;
  popularPlatforms: {
    platform: RealEstatePlatform;
    usagePercentage: number;
    listingCount: number;
  }[];
  monthlyGrowth: number;
}

class PlatformBundleServiceClass {
  private bundles: Map<string, PlatformBundle> = new Map();
  private subscriptions: Map<string, UserSubscription> = new Map();
  private pricing: Map<RealEstatePlatform, PlatformPricing> = new Map();
  private isInitialized = false;

  /**
   * Initialize the bundle service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load existing data
      this.loadBundles();
      this.loadSubscriptions();
      this.loadPricing();

      // Initialize default bundles if none exist
      if (this.bundles.size === 0) {
        this.initializeDefaultBundles();
      }

      // Initialize default pricing if none exists
      if (this.pricing.size === 0) {
        this.initializeDefaultPricing();
      }

      this.isInitialized = true;
      console.log('PlatformBundleService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize PlatformBundleService:', error);
      throw error;
    }
  }

  /**
   * Get all available bundles
   */
  getAvailableBundles(): PlatformBundle[] {
    return Array.from(this.bundles.values())
      .filter(bundle => bundle.isActive)
      .sort((a, b) => a.totalPrice - b.totalPrice);
  }

  /**
   * Get bundle by ID
   */
  getBundle(bundleId: string): PlatformBundle | null {
    return this.bundles.get(bundleId) || null;
  }

  /**
   * Create new bundle (Super Admin only)
   */
  async createBundle(bundleData: Omit<PlatformBundle, 'id' | 'createdAt' | 'updatedAt'>): Promise<PlatformBundle> {
    const bundle: PlatformBundle = {
      ...bundleData,
      id: `bundle_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.bundles.set(bundle.id, bundle);
    this.saveBundles();

    return bundle;
  }

  /**
   * Update bundle (Super Admin only)
   */
  async updateBundle(bundleId: string, updates: Partial<PlatformBundle>): Promise<PlatformBundle | null> {
    const existingBundle = this.bundles.get(bundleId);
    if (!existingBundle) return null;

    const updatedBundle: PlatformBundle = {
      ...existingBundle,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.bundles.set(bundleId, updatedBundle);
    this.saveBundles();

    return updatedBundle;
  }

  /**
   * Delete bundle (Super Admin only)
   */
  async deleteBundle(bundleId: string): Promise<boolean> {
    if (!this.bundles.has(bundleId)) return false;

    // Check if bundle has active subscriptions
    const hasActiveSubscriptions = Array.from(this.subscriptions.values())
      .some(sub => sub.bundleId === bundleId && sub.status === 'active');

    if (hasActiveSubscriptions) {
      throw new Error('Cannot delete bundle with active subscriptions');
    }

    this.bundles.delete(bundleId);
    this.saveBundles();
    return true;
  }

  /**
   * Get individual platform pricing
   */
  getPlatformPricing(platform: RealEstatePlatform): PlatformPricing | null {
    return this.pricing.get(platform) || null;
  }

  /**
   * Update platform pricing (Super Admin only)
   */
  async updatePlatformPricing(platform: RealEstatePlatform, pricing: Partial<PlatformPricing>): Promise<PlatformPricing | null> {
    const existingPricing = this.pricing.get(platform);
    if (!existingPricing) return null;

    const updatedPricing: PlatformPricing = {
      ...existingPricing,
      ...pricing
    };

    this.pricing.set(platform, updatedPricing);
    this.savePricing();

    return updatedPricing;
  }

  /**
   * Calculate bundle savings
   */
  calculateBundleSavings(bundleId: string): { originalPrice: number; bundlePrice: number; savings: number; savingsPercentage: number } {
    const bundle = this.bundles.get(bundleId);
    if (!bundle) {
      return { originalPrice: 0, bundlePrice: 0, savings: 0, savingsPercentage: 0 };
    }

    const originalPrice = bundle.platforms.reduce((total, platform) => {
      const pricing = this.pricing.get(platform);
      return total + (pricing?.basePrice || 0);
    }, 0);

    const bundlePrice = bundle.totalPrice;
    const savings = originalPrice - bundlePrice;
    const savingsPercentage = originalPrice > 0 ? (savings / originalPrice) * 100 : 0;

    return {
      originalPrice,
      bundlePrice,
      savings,
      savingsPercentage
    };
  }

  /**
   * Subscribe user to bundle
   */
  async subscribeToBundl(
    userId: string,
    bundleId: string,
    paymentFrequency: 'monthly' | 'quarterly' | 'yearly' = 'monthly'
  ): Promise<UserSubscription> {
    const bundle = this.bundles.get(bundleId);
    if (!bundle || !bundle.isActive) {
      throw new Error('Bundle not found or inactive');
    }

    // Calculate price based on payment frequency
    let totalPrice = bundle.totalPrice;
    const frequencyMultipliers = { monthly: 1, quarterly: 2.7, yearly: 10 }; // Discounts for longer commitments
    totalPrice *= frequencyMultipliers[paymentFrequency];

    // Create subscription
    const subscription: UserSubscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId,
      type: 'bundle',
      bundleId,
      status: 'active',
      startDate: new Date().toISOString(),
      autoRenew: true,
      totalPrice,
      paymentFrequency,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nextBillingDate: this.calculateNextBillingDate(paymentFrequency)
    };

    this.subscriptions.set(subscription.id, subscription);
    this.saveSubscriptions();

    return subscription;
  }

  /**
   * Subscribe user to individual platform
   */
  async subscribeToPlattform(
    userId: string,
    platform: RealEstatePlatform,
    paymentFrequency: 'monthly' | 'quarterly' | 'yearly' = 'monthly'
  ): Promise<UserSubscription> {
    const pricing = this.pricing.get(platform);
    if (!pricing || !pricing.isActive) {
      throw new Error('Platform pricing not found or inactive');
    }

    // Calculate price based on payment frequency and pricing type
    let totalPrice = pricing.basePrice;
    const frequencyMultipliers = { monthly: 1, quarterly: 2.7, yearly: 10 };
    
    if (pricing.priceType === 'monthly_subscription') {
      totalPrice *= frequencyMultipliers[paymentFrequency];
    }

    const subscription: UserSubscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId,
      type: 'individual',
      platformId: platform,
      status: 'active',
      startDate: new Date().toISOString(),
      autoRenew: true,
      totalPrice,
      paymentFrequency,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nextBillingDate: this.calculateNextBillingDate(paymentFrequency),
      // For credit-based subscriptions
      remainingListings: pricing.priceType === 'credit_based' ? 10 : undefined,
      usedListings: pricing.priceType === 'credit_based' ? 0 : undefined
    };

    this.subscriptions.set(subscription.id, subscription);
    this.saveSubscriptions();

    return subscription;
  }

  /**
   * Get user subscriptions
   */
  getUserSubscriptions(userId: string): UserSubscription[] {
    return Array.from(this.subscriptions.values())
      .filter(sub => sub.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, immediate: boolean = false): Promise<boolean> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return false;

    if (immediate) {
      subscription.status = 'inactive';
      subscription.endDate = new Date().toISOString();
    } else {
      // Cancel at end of billing period
      subscription.autoRenew = false;
      subscription.endDate = subscription.nextBillingDate;
    }

    subscription.updatedAt = new Date().toISOString();
    this.saveSubscriptions();

    return true;
  }

  /**
   * Check if user can access platform
   */
  canUserAccessPlatform(userId: string, platform: RealEstatePlatform): boolean {
    const userSubscriptions = this.getUserSubscriptions(userId)
      .filter(sub => sub.status === 'active');

    // Check individual platform subscription
    const hasIndividualAccess = userSubscriptions.some(sub => 
      sub.type === 'individual' && sub.platformId === platform
    );

    if (hasIndividualAccess) return true;

    // Check bundle access
    const hasBundleAccess = userSubscriptions.some(sub => {
      if (sub.type === 'bundle' && sub.bundleId) {
        const bundle = this.bundles.get(sub.bundleId);
        return bundle?.platforms.includes(platform) || false;
      }
      return false;
    });

    return hasBundleAccess;
  }

  /**
   * Get bundle usage statistics (Super Admin only)
   */
  getBundleUsageStats(bundleId: string): BundleUsageStats {
    const bundleSubscriptions = Array.from(this.subscriptions.values())
      .filter(sub => sub.bundleId === bundleId);

    const totalUsers = bundleSubscriptions.length;
    const activeUsers = bundleSubscriptions.filter(sub => sub.status === 'active').length;
    const totalRevenue = bundleSubscriptions
      .filter(sub => sub.status === 'active')
      .reduce((sum, sub) => sum + sub.totalPrice, 0);

    // Mock platform usage data (in real app, this would come from actual usage tracking)
    const bundle = this.bundles.get(bundleId);
    const popularPlatforms = bundle?.platforms.map(platform => ({
      platform,
      usagePercentage: Math.random() * 100,
      listingCount: Math.floor(Math.random() * 1000)
    })) || [];

    return {
      bundleId,
      totalUsers,
      activeUsers,
      totalRevenue,
      averageUsage: totalUsers > 0 ? totalRevenue / totalUsers : 0,
      popularPlatforms: popularPlatforms.sort((a, b) => b.usagePercentage - a.usagePercentage),
      monthlyGrowth: Math.random() * 20 - 5 // -5% to +15% growth
    };
  }

  /**
   * Process billing (called by scheduled job)
   */
  async processBilling(): Promise<{ processed: number; failed: number }> {
    const today = new Date().toISOString().split('T')[0];
    let processed = 0;
    let failed = 0;

    for (const subscription of this.subscriptions.values()) {
      if (subscription.status === 'active' && 
          subscription.nextBillingDate && 
          subscription.nextBillingDate <= today &&
          subscription.autoRenew) {
        
        try {
          // Process payment (in real app, integrate with payment processor)
          const paymentSuccess = await this.processPayment(subscription);
          
          if (paymentSuccess) {
            subscription.lastBillingDate = today;
            subscription.nextBillingDate = this.calculateNextBillingDate(subscription.paymentFrequency, new Date());
            subscription.updatedAt = new Date().toISOString();
            
            // Reset credit-based usage
            if (subscription.remainingListings !== undefined) {
              subscription.remainingListings = 10; // Reset credits
              subscription.usedListings = 0;
            }
            
            processed++;
          } else {
            // Handle payment failure
            subscription.status = 'suspended';
            subscription.updatedAt = new Date().toISOString();
            failed++;
          }
        } catch (error) {
          console.error(`Failed to process billing for subscription ${subscription.id}:`, error);
          failed++;
        }
      }
    }

    this.saveSubscriptions();
    return { processed, failed };
  }

  /**
   * Private methods
   */

  private calculateNextBillingDate(frequency: 'monthly' | 'quarterly' | 'yearly', fromDate?: Date): string {
    const date = fromDate || new Date();
    
    switch (frequency) {
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    
    return date.toISOString().split('T')[0];
  }

  private async processPayment(subscription: UserSubscription): Promise<boolean> {
    // Mock payment processing (90% success rate)
    await new Promise(resolve => setTimeout(resolve, 100));
    return Math.random() > 0.1;
  }

  private initializeDefaultBundles(): void {
    const defaultBundles: PlatformBundle[] = [
      {
        id: 'starter_bundle',
        name: 'Starter Package',
        description: 'Perfect for small property managers with 1-5 properties',
        platforms: ['craigslist', 'apartments_com', 'trulia'],
        discountPercentage: 15,
        totalPrice: 39.99,
        originalPrice: 47.06,
        isActive: true,
        features: [
          'List on 3 popular platforms',
          'Basic analytics',
          'Email support',
          'Up to 20 photos per listing'
        ],
        maxListings: 10,
        validityPeriod: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'professional_bundle',
        name: 'Professional Package',
        description: 'Ideal for growing property management companies',
        platforms: ['zillow', 'apartments_com', 'trulia', 'rentberry', 'zumper', 'apartment_list'],
        discountPercentage: 25,
        totalPrice: 89.99,
        originalPrice: 119.94,
        isActive: true,
        isPopular: true,
        features: [
          'List on 6 premium platforms',
          'Advanced analytics',
          'Priority support',
          'Unlimited photos',
          'Featured listings',
          'Lead management'
        ],
        maxListings: 50,
        validityPeriod: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'enterprise_bundle',
        name: 'Enterprise Package',
        description: 'Complete solution for large property management firms',
        platforms: [
          'zillow', 'realtors_com', 'apartments_com', 'trulia', 'rentberry',
          'dwellsy', 'zumper', 'rent_jungle', 'apartment_list', 'cozycozy',
          'doorsteps', 'move_com'
        ],
        discountPercentage: 35,
        totalPrice: 199.99,
        originalPrice: 307.68,
        isActive: true,
        features: [
          'List on 12+ platforms',
          'Full analytics suite',
          'Dedicated account manager',
          'Unlimited everything',
          'Custom integrations',
          'API access',
          'White-label options'
        ],
        validityPeriod: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    defaultBundles.forEach(bundle => {
      this.bundles.set(bundle.id, bundle);
    });

    this.saveBundles();
  }

  private initializeDefaultPricing(): void {
    const platforms: RealEstatePlatform[] = [
      'zillow', 'realtors_com', 'apartments_com', 'craigslist', 'trulia',
      'rentberry', 'dwellsy', 'zumper', 'rent_jungle', 'rentprep',
      'move_com', 'rentdigs', 'apartment_list', 'cozycozy', 'doorsteps'
    ];

    platforms.forEach(platform => {
      const pricing: PlatformPricing = {
        id: `${platform}_pricing`,
        platform,
        priceType: Math.random() > 0.5 ? 'per_listing' : 'monthly_subscription',
        basePrice: Math.floor(Math.random() * 40) + 10, // $10-$50
        currency: 'USD',
        bundleEligible: true,
        isActive: true,
        effectiveDate: new Date().toISOString()
      };

      this.pricing.set(platform, pricing);
    });

    this.savePricing();
  }

  private loadBundles(): void {
    try {
      const bundles = LocalStorageService.getItem('platform_bundles', []);
      bundles.forEach((bundle: PlatformBundle) => {
        this.bundles.set(bundle.id, bundle);
      });
    } catch (error) {
      console.error('Failed to load bundles:', error);
    }
  }

  private saveBundles(): void {
    try {
      const bundles = Array.from(this.bundles.values());
      LocalStorageService.setItem('platform_bundles', bundles);
    } catch (error) {
      console.error('Failed to save bundles:', error);
    }
  }

  private loadSubscriptions(): void {
    try {
      const subscriptions = LocalStorageService.getItem('user_subscriptions', []);
      subscriptions.forEach((sub: UserSubscription) => {
        this.subscriptions.set(sub.id, sub);
      });
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    }
  }

  private saveSubscriptions(): void {
    try {
      const subscriptions = Array.from(this.subscriptions.values());
      LocalStorageService.setItem('user_subscriptions', subscriptions);
    } catch (error) {
      console.error('Failed to save subscriptions:', error);
    }
  }

  private loadPricing(): void {
    try {
      const pricingData = LocalStorageService.getItem('platform_pricing', []);
      pricingData.forEach((pricing: PlatformPricing) => {
        this.pricing.set(pricing.platform, pricing);
      });
    } catch (error) {
      console.error('Failed to load pricing:', error);
    }
  }

  private savePricing(): void {
    try {
      const pricing = Array.from(this.pricing.values());
      LocalStorageService.setItem('platform_pricing', pricing);
    } catch (error) {
      console.error('Failed to save pricing:', error);
    }
  }
}

// Export singleton instance
export const PlatformBundleService = new PlatformBundleServiceClass();
export default PlatformBundleService;
