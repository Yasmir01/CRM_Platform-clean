/**
 * Webhook Handler Service
 * Handles webhook events from real estate platforms
 */

import { PlatformConnectionService } from './PlatformConnectionService';
import { LocalStorageService } from './LocalStorageService';
import { RealEstatePlatform } from '../types/RealEstatePlatformTypes';

interface WebhookEvent {
  id: string;
  platform: RealEstatePlatform;
  eventType: string;
  timestamp: string;
  payload: any;
  processed: boolean;
  processingResult?: {
    success: boolean;
    action?: string;
    error?: string;
  };
  signature?: string;
  userAgent?: string;
  ipAddress?: string;
}

interface WebhookSubscription {
  id: string;
  platform: RealEstatePlatform;
  eventTypes: string[];
  endpoint: string;
  secret: string;
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
}

interface WebhookStats {
  totalEvents: number;
  processedEvents: number;
  failedEvents: number;
  eventsByPlatform: Record<RealEstatePlatform, number>;
  eventsByType: Record<string, number>;
  recentEvents: WebhookEvent[];
}

class WebhookHandlerServiceClass {
  private isInitialized = false;
  private eventQueue: WebhookEvent[] = [];
  private processing = false;

  /**
   * Initialize the webhook handler service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize platform connection service
      await PlatformConnectionService.initialize();

      // Set up webhook subscriptions
      this.initializeWebhookSubscriptions();

      // Start processing queued events
      this.startEventProcessor();

      this.isInitialized = true;
      console.log('WebhookHandlerService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize WebhookHandlerService:', error);
      throw error;
    }
  }

  /**
   * Handle incoming webhook from platform
   */
  async handleWebhook(
    platform: RealEstatePlatform,
    payload: any,
    headers: Record<string, string> = {},
    metadata: {
      userAgent?: string;
      ipAddress?: string;
    } = {}
  ): Promise<{
    success: boolean;
    eventId: string;
    message: string;
  }> {
    try {
      // Validate webhook signature if available
      const isValid = await this.validateWebhookSignature(platform, payload, headers);
      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }

      // Create webhook event
      const eventId = `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const webhookEvent: WebhookEvent = {
        id: eventId,
        platform,
        eventType: this.extractEventType(platform, payload),
        timestamp: new Date().toISOString(),
        payload,
        processed: false,
        signature: headers['x-signature'] || headers['x-hub-signature'],
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress
      };

      // Store webhook event
      this.storeWebhookEvent(webhookEvent);

      // Add to processing queue
      this.eventQueue.push(webhookEvent);

      // Process immediately if not already processing
      if (!this.processing) {
        this.processEventQueue();
      }

      return {
        success: true,
        eventId,
        message: 'Webhook received and queued for processing'
      };

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Webhook handling failed for ${platform}:`, error);
      
      return {
        success: false,
        eventId: '',
        message: `Webhook handling failed: ${message}`
      };
    }
  }

  /**
   * Process webhook event queue
   */
  private async processEventQueue(): Promise<void> {
    if (this.processing || this.eventQueue.length === 0) {
      return;
    }

    this.processing = true;

    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift()!;
        await this.processWebhookEvent(event);
        
        // Small delay between processing events
        await this.delay(100);
      }
    } catch (error) {
      console.error('Error processing webhook queue:', error);
    } finally {
      this.processing = false;
    }
  }

  /**
   * Process individual webhook event
   */
  private async processWebhookEvent(event: WebhookEvent): Promise<void> {
    try {
      // Delegate to platform-specific adapter
      const result = await PlatformConnectionService.handleWebhook(event.platform, event.payload);

      // Update event with processing result
      event.processed = true;
      event.processingResult = {
        success: result.processed,
        action: result.action,
        error: result.processed ? undefined : 'Processing failed'
      };

      // Handle specific event types
      if (result.processed && result.action) {
        await this.handleSpecificAction(event, result.action);
      }

      // Update stored event
      this.updateWebhookEvent(event);

      console.log(`Webhook event ${event.id} processed successfully`);

    } catch (error) {
      console.error(`Failed to process webhook event ${event.id}:`, error);
      
      // Mark as failed
      event.processed = true;
      event.processingResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Processing error'
      };

      this.updateWebhookEvent(event);
    }
  }

  /**
   * Handle specific webhook actions
   */
  private async handleSpecificAction(event: WebhookEvent, action: string): Promise<void> {
    switch (action) {
      case 'listing_published':
        await this.handleListingPublished(event);
        break;
      case 'listing_updated':
        await this.handleListingUpdated(event);
        break;
      case 'listing_removed':
        await this.handleListingRemoved(event);
        break;
      case 'lead_received':
        await this.handleLeadReceived(event);
        break;
      case 'listing_expired':
        await this.handleListingExpired(event);
        break;
      case 'listing_rejected':
        await this.handleListingRejected(event);
        break;
      default:
        console.log(`Unknown webhook action: ${action}`);
    }
  }

  /**
   * Handle listing published event
   */
  private async handleListingPublished(event: WebhookEvent): Promise<void> {
    const { payload } = event;
    
    try {
      // Extract listing information
      const listingInfo = this.extractListingInfo(event.platform, payload);
      
      if (listingInfo) {
        // Store external listing reference
        this.storeExternalListing({
          propertyId: listingInfo.propertyId || payload.property_id || payload.listing_id,
          platform: event.platform,
          externalId: listingInfo.externalId,
          listingUrl: listingInfo.listingUrl,
          publishedAt: event.timestamp,
          status: 'published'
        });

        // Send notification
        this.sendNotification({
          type: 'listing_published',
          platform: event.platform,
          message: `Listing published successfully on ${event.platform}`,
          data: listingInfo
        });

        console.log(`Listing published on ${event.platform}: ${listingInfo.externalId}`);
      }
    } catch (error) {
      console.error('Failed to handle listing published event:', error);
    }
  }

  /**
   * Handle listing updated event
   */
  private async handleListingUpdated(event: WebhookEvent): Promise<void> {
    const { payload } = event;
    
    try {
      const listingInfo = this.extractListingInfo(event.platform, payload);
      
      if (listingInfo) {
        // Update external listing status
        this.updateExternalListingStatus(
          listingInfo.externalId,
          event.platform,
          'updated',
          event.timestamp
        );

        this.sendNotification({
          type: 'listing_updated',
          platform: event.platform,
          message: `Listing updated on ${event.platform}`,
          data: listingInfo
        });

        console.log(`Listing updated on ${event.platform}: ${listingInfo.externalId}`);
      }
    } catch (error) {
      console.error('Failed to handle listing updated event:', error);
    }
  }

  /**
   * Handle listing removed event
   */
  private async handleListingRemoved(event: WebhookEvent): Promise<void> {
    const { payload } = event;
    
    try {
      const listingInfo = this.extractListingInfo(event.platform, payload);
      
      if (listingInfo) {
        // Update external listing status
        this.updateExternalListingStatus(
          listingInfo.externalId,
          event.platform,
          'removed',
          event.timestamp
        );

        this.sendNotification({
          type: 'listing_removed',
          platform: event.platform,
          message: `Listing removed from ${event.platform}`,
          data: listingInfo
        });

        console.log(`Listing removed from ${event.platform}: ${listingInfo.externalId}`);
      }
    } catch (error) {
      console.error('Failed to handle listing removed event:', error);
    }
  }

  /**
   * Handle lead received event
   */
  private async handleLeadReceived(event: WebhookEvent): Promise<void> {
    const { payload } = event;
    
    try {
      const leadInfo = this.extractLeadInfo(event.platform, payload);
      
      if (leadInfo) {
        // Store lead information
        this.storeLead({
          id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          platform: event.platform,
          propertyId: leadInfo.propertyId,
          contactInfo: leadInfo.contactInfo,
          message: leadInfo.message,
          source: leadInfo.source || event.platform,
          receivedAt: event.timestamp,
          status: 'new'
        });

        this.sendNotification({
          type: 'lead_received',
          platform: event.platform,
          message: `New lead received from ${event.platform}`,
          data: leadInfo,
          priority: 'high'
        });

        console.log(`Lead received from ${event.platform} for property ${leadInfo.propertyId}`);
      }
    } catch (error) {
      console.error('Failed to handle lead received event:', error);
    }
  }

  /**
   * Handle listing expired event
   */
  private async handleListingExpired(event: WebhookEvent): Promise<void> {
    const { payload } = event;
    
    try {
      const listingInfo = this.extractListingInfo(event.platform, payload);
      
      if (listingInfo) {
        this.updateExternalListingStatus(
          listingInfo.externalId,
          event.platform,
          'expired',
          event.timestamp
        );

        this.sendNotification({
          type: 'listing_expired',
          platform: event.platform,
          message: `Listing expired on ${event.platform}`,
          data: listingInfo,
          priority: 'medium'
        });

        console.log(`Listing expired on ${event.platform}: ${listingInfo.externalId}`);
      }
    } catch (error) {
      console.error('Failed to handle listing expired event:', error);
    }
  }

  /**
   * Handle listing rejected event
   */
  private async handleListingRejected(event: WebhookEvent): Promise<void> {
    const { payload } = event;
    
    try {
      const listingInfo = this.extractListingInfo(event.platform, payload);
      const rejectionReason = payload.reason || payload.rejection_reason || 'No reason provided';
      
      if (listingInfo) {
        this.updateExternalListingStatus(
          listingInfo.externalId,
          event.platform,
          'rejected',
          event.timestamp,
          rejectionReason
        );

        this.sendNotification({
          type: 'listing_rejected',
          platform: event.platform,
          message: `Listing rejected on ${event.platform}: ${rejectionReason}`,
          data: { ...listingInfo, reason: rejectionReason },
          priority: 'high'
        });

        console.log(`Listing rejected on ${event.platform}: ${listingInfo.externalId} - ${rejectionReason}`);
      }
    } catch (error) {
      console.error('Failed to handle listing rejected event:', error);
    }
  }

  /**
   * Get webhook statistics
   */
  getWebhookStats(timeframe: 'day' | 'week' | 'month' = 'month'): WebhookStats {
    const events = this.getWebhookEvents();
    const cutoffDate = this.getCutoffDate(timeframe);
    const recentEvents = events.filter(event => new Date(event.timestamp) >= cutoffDate);

    const totalEvents = recentEvents.length;
    const processedEvents = recentEvents.filter(event => event.processed && event.processingResult?.success).length;
    const failedEvents = recentEvents.filter(event => event.processed && !event.processingResult?.success).length;

    // Platform breakdown
    const eventsByPlatform: Record<string, number> = {};
    const supportedPlatforms = PlatformConnectionService.getSupportedPlatforms();
    supportedPlatforms.forEach(platform => {
      eventsByPlatform[platform] = recentEvents.filter(event => event.platform === platform).length;
    });

    // Event type breakdown
    const eventsByType: Record<string, number> = {};
    recentEvents.forEach(event => {
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
    });

    return {
      totalEvents,
      processedEvents,
      failedEvents,
      eventsByPlatform: eventsByPlatform as any,
      eventsByType,
      recentEvents: recentEvents.slice(0, 20) // Last 20 events
    };
  }

  /**
   * Get webhook subscriptions
   */
  getWebhookSubscriptions(): WebhookSubscription[] {
    return LocalStorageService.getItem('webhook_subscriptions', []);
  }

  /**
   * Create webhook subscription
   */
  createWebhookSubscription(subscription: Omit<WebhookSubscription, 'id' | 'createdAt'>): string {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    const newSubscription: WebhookSubscription = {
      ...subscription,
      id: subscriptionId,
      createdAt: new Date().toISOString()
    };

    const subscriptions = this.getWebhookSubscriptions();
    subscriptions.push(newSubscription);
    LocalStorageService.setItem('webhook_subscriptions', subscriptions);

    return subscriptionId;
  }

  // Private utility methods

  private initializeWebhookSubscriptions(): void {
    const existingSubscriptions = this.getWebhookSubscriptions();
    
    if (existingSubscriptions.length === 0) {
      // Create default subscriptions for supported platforms
      const defaultSubscriptions = [
        {
          platform: 'zillow' as RealEstatePlatform,
          eventTypes: ['listing.published', 'listing.updated', 'listing.removed', 'lead.received'],
          endpoint: '/webhook/zillow',
          secret: this.generateWebhookSecret(),
          isActive: true
        },
        {
          platform: 'apartments_com' as RealEstatePlatform,
          eventTypes: ['property.published', 'property.updated', 'property.deleted', 'lead.received'],
          endpoint: '/webhook/apartments-com',
          secret: this.generateWebhookSecret(),
          isActive: true
        }
      ];

      defaultSubscriptions.forEach(sub => this.createWebhookSubscription(sub));
    }
  }

  private async validateWebhookSignature(
    platform: RealEstatePlatform,
    payload: any,
    headers: Record<string, string>
  ): Promise<boolean> {
    // In a real implementation, validate webhook signatures according to each platform's spec
    // For now, return true for demonstration
    return true;
  }

  private extractEventType(platform: RealEstatePlatform, payload: any): string {
    // Extract event type based on platform-specific payload structure
    switch (platform) {
      case 'zillow':
        return payload.event_type || payload.type || 'unknown';
      case 'apartments_com':
        return payload.event || payload.event_type || 'unknown';
      case 'craigslist':
        return 'manual_update'; // Craigslist doesn't support webhooks
      default:
        return payload.event || payload.type || payload.event_type || 'unknown';
    }
  }

  private extractListingInfo(platform: RealEstatePlatform, payload: any): {
    externalId: string;
    listingUrl?: string;
    propertyId?: string;
  } | null {
    // Extract listing information based on platform-specific payload structure
    switch (platform) {
      case 'zillow':
        return {
          externalId: payload.listing_id || payload.id,
          listingUrl: payload.listing_url || payload.url,
          propertyId: payload.property_id || payload.external_id
        };
      case 'apartments_com':
        return {
          externalId: payload.property_id || payload.id,
          listingUrl: payload.property_url || payload.url,
          propertyId: payload.external_property_id || payload.reference_id
        };
      default:
        return {
          externalId: payload.id || payload.listing_id || payload.property_id,
          listingUrl: payload.url || payload.listing_url,
          propertyId: payload.property_id || payload.external_id
        };
    }
  }

  private extractLeadInfo(platform: RealEstatePlatform, payload: any): {
    propertyId: string;
    contactInfo: {
      name: string;
      email: string;
      phone?: string;
    };
    message?: string;
    source?: string;
  } | null {
    // Extract lead information based on platform-specific payload structure
    const leadData = payload.lead || payload.contact || payload;
    
    return {
      propertyId: leadData.property_id || leadData.listing_id,
      contactInfo: {
        name: leadData.name || leadData.contact_name || 'Unknown',
        email: leadData.email || leadData.contact_email,
        phone: leadData.phone || leadData.contact_phone
      },
      message: leadData.message || leadData.inquiry || leadData.comments,
      source: leadData.source || platform
    };
  }

  private storeWebhookEvent(event: WebhookEvent): void {
    try {
      const events = LocalStorageService.getItem('webhook_events', []);
      events.unshift(event);
      
      // Keep only last 1000 events
      if (events.length > 1000) {
        events.splice(1000);
      }
      
      LocalStorageService.setItem('webhook_events', events);
    } catch (error) {
      console.error('Failed to store webhook event:', error);
    }
  }

  private updateWebhookEvent(event: WebhookEvent): void {
    try {
      const events = LocalStorageService.getItem('webhook_events', []);
      const index = events.findIndex((e: WebhookEvent) => e.id === event.id);
      
      if (index !== -1) {
        events[index] = event;
        LocalStorageService.setItem('webhook_events', events);
      }
    } catch (error) {
      console.error('Failed to update webhook event:', error);
    }
  }

  private getWebhookEvents(): WebhookEvent[] {
    return LocalStorageService.getItem('webhook_events', []);
  }

  private storeExternalListing(listing: any): void {
    try {
      const listings = LocalStorageService.getItem('external_listings', []);
      listings.unshift(listing);
      LocalStorageService.setItem('external_listings', listings);
    } catch (error) {
      console.error('Failed to store external listing:', error);
    }
  }

  private updateExternalListingStatus(
    externalId: string,
    platform: RealEstatePlatform,
    status: string,
    timestamp: string,
    reason?: string
  ): void {
    try {
      const listings = LocalStorageService.getItem('external_listings', []);
      const index = listings.findIndex(
        (listing: any) => listing.externalId === externalId && listing.platform === platform
      );
      
      if (index !== -1) {
        listings[index].status = status;
        listings[index].lastUpdated = timestamp;
        if (reason) {
          listings[index].reason = reason;
        }
        LocalStorageService.setItem('external_listings', listings);
      }
    } catch (error) {
      console.error('Failed to update external listing status:', error);
    }
  }

  private storeLead(lead: any): void {
    try {
      const leads = LocalStorageService.getItem('platform_leads', []);
      leads.unshift(lead);
      
      // Keep only last 500 leads
      if (leads.length > 500) {
        leads.splice(500);
      }
      
      LocalStorageService.setItem('platform_leads', leads);
    } catch (error) {
      console.error('Failed to store lead:', error);
    }
  }

  private sendNotification(notification: {
    type: string;
    platform: RealEstatePlatform;
    message: string;
    data?: any;
    priority?: 'low' | 'medium' | 'high';
  }): void {
    try {
      const notifications = LocalStorageService.getItem('platform_notifications', []);
      notifications.unshift({
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        timestamp: new Date().toISOString(),
        read: false,
        ...notification
      });
      
      // Keep only last 100 notifications
      if (notifications.length > 100) {
        notifications.splice(100);
      }
      
      LocalStorageService.setItem('platform_notifications', notifications);

      // In a real implementation, send push notifications, emails, etc.
      console.log(`Notification: ${notification.message}`);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  private generateWebhookSecret(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private getCutoffDate(timeframe: 'day' | 'week' | 'month'): Date {
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
    }

    return cutoff;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const WebhookHandlerService = new WebhookHandlerServiceClass();
export default WebhookHandlerService;
