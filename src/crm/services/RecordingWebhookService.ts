/**
 * Recording Webhook Service
 * 
 * Handles incoming webhook calls from various communication providers
 * for call recording events and processing.
 */

export interface WebhookEvent {
  id: string;
  type: string;
  provider: string;
  timestamp: string;
  data: any;
  signature?: string;
  retryCount?: number;
}

export interface RecordingWebhookData {
  callId: string;
  recordingId: string;
  recordingUrl: string;
  duration: number;
  status: 'completed' | 'failed' | 'processing';
  fileSize?: number;
  transcription?: string;
  callDirection: 'inbound' | 'outbound';
  fromNumber: string;
  toNumber: string;
  startTime: string;
  endTime: string;
  provider: string;
  qualityScore?: number;
  errorMessage?: string;
}

export interface WebhookConfig {
  url: string;
  secret: string;
  events: string[];
  retryAttempts: number;
  timeout: number;
}

export class RecordingWebhookService {
  private webhookConfigs: Map<string, WebhookConfig> = new Map();
  private eventHandlers: Map<string, ((event: WebhookEvent) => Promise<void>)[]> = new Map();

  constructor() {
    this.initializeWebhookConfigs();
  }

  private initializeWebhookConfigs() {
    // Default webhook configurations for different providers
    this.webhookConfigs.set('twilio', {
      url: '/api/webhooks/twilio/recordings',
      secret: process.env.TWILIO_WEBHOOK_SECRET || 'twilio_secret_key',
      events: ['recording.completed', 'recording.failed', 'transcription.completed'],
      retryAttempts: 3,
      timeout: 30000,
    });

    this.webhookConfigs.set('vonage', {
      url: '/api/webhooks/vonage/recordings',
      secret: process.env.VONAGE_WEBHOOK_SECRET || 'vonage_secret_key',
      events: ['recording.completed', 'recording.failed'],
      retryAttempts: 3,
      timeout: 30000,
    });

    this.webhookConfigs.set('plivo', {
      url: '/api/webhooks/plivo/recordings',
      secret: process.env.PLIVO_WEBHOOK_SECRET || 'plivo_secret_key',
      events: ['recording.completed', 'recording.failed'],
      retryAttempts: 3,
      timeout: 30000,
    });

    this.webhookConfigs.set('signalwire', {
      url: '/api/webhooks/signalwire/recordings',
      secret: process.env.SIGNALWIRE_WEBHOOK_SECRET || 'signalwire_secret_key',
      events: ['recording.completed', 'recording.failed', 'transcription.completed'],
      retryAttempts: 3,
      timeout: 30000,
    });

    this.webhookConfigs.set('telnyx', {
      url: '/api/webhooks/telnyx/recordings',
      secret: process.env.TELNYX_WEBHOOK_SECRET || 'telnyx_secret_key',
      events: ['call.recording.completed', 'call.recording.failed'],
      retryAttempts: 3,
      timeout: 30000,
    });

    this.webhookConfigs.set('bandwidth', {
      url: '/api/webhooks/bandwidth/recordings',
      secret: process.env.BANDWIDTH_WEBHOOK_SECRET || 'bandwidth_secret_key',
      events: ['recording.completed', 'recording.failed'],
      retryAttempts: 3,
      timeout: 30000,
    });

    this.webhookConfigs.set('sms-it', {
      url: '/api/webhooks/sms-it/recordings',
      secret: process.env.SMS_IT_WEBHOOK_SECRET || 'sms_it_secret_key',
      events: ['recording.completed', 'recording.failed', 'call.ended'],
      retryAttempts: 3,
      timeout: 30000,
    });
  }

  /**
   * Register an event handler for specific webhook events
   */
  onEvent(eventType: string, handler: (event: WebhookEvent) => Promise<void>) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  /**
   * Process incoming webhook from Twilio
   */
  async processTwilioWebhook(payload: any, signature: string): Promise<void> {
    const isValid = this.validateTwilioSignature(payload, signature);
    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    const event: WebhookEvent = {
      id: `twilio_${payload.CallSid}_${Date.now()}`,
      type: this.mapTwilioEventType(payload),
      provider: 'twilio',
      timestamp: new Date().toISOString(),
      data: this.transformTwilioData(payload),
      signature,
    };

    await this.processEvent(event);
  }

  /**
   * Process incoming webhook from Vonage/Nexmo
   */
  async processVonageWebhook(payload: any): Promise<void> {
    const event: WebhookEvent = {
      id: `vonage_${payload.conversation_uuid}_${Date.now()}`,
      type: this.mapVonageEventType(payload),
      provider: 'vonage',
      timestamp: new Date().toISOString(),
      data: this.transformVonageData(payload),
    };

    await this.processEvent(event);
  }

  /**
   * Process incoming webhook from Plivo
   */
  async processPlivoWebhook(payload: any): Promise<void> {
    const event: WebhookEvent = {
      id: `plivo_${payload.CallUUID}_${Date.now()}`,
      type: this.mapPlivoEventType(payload),
      provider: 'plivo',
      timestamp: new Date().toISOString(),
      data: this.transformPlivoData(payload),
    };

    await this.processEvent(event);
  }

  /**
   * Process incoming webhook from SignalWire
   */
  async processSignalWireWebhook(payload: any, signature: string): Promise<void> {
    const isValid = this.validateSignalWireSignature(payload, signature);
    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    const event: WebhookEvent = {
      id: `signalwire_${payload.CallSid}_${Date.now()}`,
      type: this.mapSignalWireEventType(payload),
      provider: 'signalwire',
      timestamp: new Date().toISOString(),
      data: this.transformSignalWireData(payload),
      signature,
    };

    await this.processEvent(event);
  }

  /**
   * Process incoming webhook from Telnyx
   */
  async processTelnyxWebhook(payload: any): Promise<void> {
    const event: WebhookEvent = {
      id: `telnyx_${payload.data.id}_${Date.now()}`,
      type: payload.data.event_type,
      provider: 'telnyx',
      timestamp: new Date().toISOString(),
      data: this.transformTelnyxData(payload.data),
    };

    await this.processEvent(event);
  }

  /**
   * Process incoming webhook from Bandwidth
   */
  async processBandwidthWebhook(payload: any): Promise<void> {
    const event: WebhookEvent = {
      id: `bandwidth_${payload.callId}_${Date.now()}`,
      type: this.mapBandwidthEventType(payload),
      provider: 'bandwidth',
      timestamp: new Date().toISOString(),
      data: this.transformBandwidthData(payload),
    };

    await this.processEvent(event);
  }

  /**
   * Process incoming webhook from SMS-IT
   */
  async processSmsItWebhook(payload: any): Promise<void> {
    const event: WebhookEvent = {
      id: `smsit_${payload.call_id}_${Date.now()}`,
      type: this.mapSmsItEventType(payload),
      provider: 'sms-it',
      timestamp: new Date().toISOString(),
      data: this.transformSmsItData(payload),
    };

    await this.processEvent(event);
  }

  /**
   * Core event processing logic
   */
  private async processEvent(event: WebhookEvent): Promise<void> {
    try {
      // Store the event for audit/debugging
      await this.storeWebhookEvent(event);

      // Process based on event type
      switch (event.type) {
        case 'recording.completed':
          await this.handleRecordingCompleted(event);
          break;
        case 'recording.failed':
          await this.handleRecordingFailed(event);
          break;
        case 'transcription.completed':
          await this.handleTranscriptionCompleted(event);
          break;
        case 'call.ended':
          await this.handleCallEnded(event);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      // Trigger registered event handlers
      const handlers = this.eventHandlers.get(event.type) || [];
      await Promise.all(handlers.map(handler => handler(event)));

    } catch (error) {
      console.error('Error processing webhook event:', error);
      await this.handleWebhookError(event, error);
    }
  }

  /**
   * Handle completed recording events
   */
  private async handleRecordingCompleted(event: WebhookEvent): Promise<void> {
    const recordingData = event.data as RecordingWebhookData;
    
    // Update recording in database/storage
    const recordingUpdate = {
      id: recordingData.recordingId,
      callId: recordingData.callId,
      recordingUrl: recordingData.recordingUrl,
      duration: recordingData.duration,
      fileSize: recordingData.fileSize,
      status: 'completed',
      provider: event.provider,
      quality: this.calculateQualityFromProvider(recordingData),
    };

    // Trigger quality analysis if enabled
    if (recordingData.recordingUrl) {
      await this.triggerQualityAnalysis(recordingUpdate);
    }

    // Start transcription if enabled and not already available
    if (!recordingData.transcription) {
      await this.requestTranscription(recordingUpdate);
    }

    console.log(`Recording completed: ${recordingData.recordingId}`);
  }

  /**
   * Handle failed recording events
   */
  private async handleRecordingFailed(event: WebhookEvent): Promise<void> {
    const recordingData = event.data as RecordingWebhookData;
    
    console.error(`Recording failed: ${recordingData.recordingId}`, recordingData.errorMessage);
    
    // Update recording status and notify administrators
    await this.notifyRecordingFailure(recordingData);
  }

  /**
   * Handle completed transcription events
   */
  private async handleTranscriptionCompleted(event: WebhookEvent): Promise<void> {
    const recordingData = event.data as RecordingWebhookData;
    
    if (recordingData.transcription) {
      // Update recording with transcription
      await this.updateRecordingTranscription(recordingData.recordingId, recordingData.transcription);
      
      // Trigger sentiment analysis and keyword detection
      await this.analyzeSentiment(recordingData.recordingId, recordingData.transcription);
      await this.detectKeywords(recordingData.recordingId, recordingData.transcription);
    }
  }

  /**
   * Handle call ended events (for immediate recording processing)
   */
  private async handleCallEnded(event: WebhookEvent): Promise<void> {
    const callData = event.data;
    
    // Check if recording should be automatically processed
    if (callData.recordingEnabled) {
      // Monitor for recording completion
      await this.monitorRecordingStatus(callData.callId);
    }
  }

  // Provider-specific data transformation methods
  private transformTwilioData(payload: any): RecordingWebhookData {
    return {
      callId: payload.CallSid,
      recordingId: payload.RecordingSid,
      recordingUrl: payload.RecordingUrl,
      duration: parseInt(payload.RecordingDuration) || 0,
      status: payload.RecordingStatus?.toLowerCase() || 'completed',
      fileSize: parseInt(payload.RecordingSize) || undefined,
      callDirection: payload.Direction?.toLowerCase() || 'inbound',
      fromNumber: payload.From,
      toNumber: payload.To,
      startTime: payload.StartTime,
      endTime: payload.EndTime || new Date().toISOString(),
      provider: 'twilio',
    };
  }

  private transformVonageData(payload: any): RecordingWebhookData {
    return {
      callId: payload.conversation_uuid,
      recordingId: payload.recording_uuid,
      recordingUrl: payload.recording_url,
      duration: payload.duration || 0,
      status: payload.status?.toLowerCase() || 'completed',
      callDirection: payload.direction?.toLowerCase() || 'inbound',
      fromNumber: payload.from,
      toNumber: payload.to,
      startTime: payload.start_time,
      endTime: payload.end_time || new Date().toISOString(),
      provider: 'vonage',
    };
  }

  private transformPlivoData(payload: any): RecordingWebhookData {
    return {
      callId: payload.CallUUID,
      recordingId: payload.RecordingID,
      recordingUrl: payload.RecordingUrl,
      duration: parseInt(payload.RecordingDuration) || 0,
      status: payload.Event?.toLowerCase().includes('completed') ? 'completed' : 'failed',
      callDirection: payload.Direction?.toLowerCase() || 'inbound',
      fromNumber: payload.From,
      toNumber: payload.To,
      startTime: payload.StartTime,
      endTime: payload.EndTime || new Date().toISOString(),
      provider: 'plivo',
    };
  }

  private transformSignalWireData(payload: any): RecordingWebhookData {
    return {
      callId: payload.CallSid,
      recordingId: payload.RecordingSid,
      recordingUrl: payload.RecordingUrl,
      duration: parseInt(payload.RecordingDuration) || 0,
      status: payload.RecordingStatus?.toLowerCase() || 'completed',
      callDirection: payload.Direction?.toLowerCase() || 'inbound',
      fromNumber: payload.From,
      toNumber: payload.To,
      startTime: payload.StartTime,
      endTime: payload.EndTime || new Date().toISOString(),
      provider: 'signalwire',
    };
  }

  private transformTelnyxData(payload: any): RecordingWebhookData {
    return {
      callId: payload.call_leg_id,
      recordingId: payload.recording_id,
      recordingUrl: payload.recording_urls?.mp3 || payload.recording_url,
      duration: payload.duration_millis ? Math.floor(payload.duration_millis / 1000) : 0,
      status: payload.status?.toLowerCase() || 'completed',
      callDirection: payload.direction?.toLowerCase() || 'inbound',
      fromNumber: payload.from,
      toNumber: payload.to,
      startTime: payload.start_time,
      endTime: payload.end_time || new Date().toISOString(),
      provider: 'telnyx',
    };
  }

  private transformBandwidthData(payload: any): RecordingWebhookData {
    return {
      callId: payload.callId,
      recordingId: payload.recordingId,
      recordingUrl: payload.mediaUrl,
      duration: payload.duration || 0,
      status: payload.state?.toLowerCase() || 'completed',
      callDirection: payload.direction?.toLowerCase() || 'inbound',
      fromNumber: payload.from,
      toNumber: payload.to,
      startTime: payload.startTime,
      endTime: payload.endTime || new Date().toISOString(),
      provider: 'bandwidth',
    };
  }

  private transformSmsItData(payload: any): RecordingWebhookData {
    return {
      callId: payload.call_id,
      recordingId: payload.recording_id,
      recordingUrl: payload.recording_url,
      duration: payload.duration_seconds || 0,
      status: payload.status?.toLowerCase() || 'completed',
      callDirection: payload.direction?.toLowerCase() || 'inbound',
      fromNumber: payload.from_number,
      toNumber: payload.to_number,
      startTime: payload.start_time,
      endTime: payload.end_time || new Date().toISOString(),
      provider: 'sms-it',
    };
  }

  // Event type mapping methods
  private mapTwilioEventType(payload: any): string {
    if (payload.RecordingStatus === 'completed') return 'recording.completed';
    if (payload.RecordingStatus === 'failed') return 'recording.failed';
    if (payload.TranscriptionStatus === 'completed') return 'transcription.completed';
    return 'unknown';
  }

  private mapVonageEventType(payload: any): string {
    if (payload.status === 'completed') return 'recording.completed';
    if (payload.status === 'failed') return 'recording.failed';
    return 'unknown';
  }

  private mapPlivoEventType(payload: any): string {
    if (payload.Event === 'RecordingCompleted') return 'recording.completed';
    if (payload.Event === 'RecordingFailed') return 'recording.failed';
    return 'unknown';
  }

  private mapSignalWireEventType(payload: any): string {
    if (payload.RecordingStatus === 'completed') return 'recording.completed';
    if (payload.RecordingStatus === 'failed') return 'recording.failed';
    if (payload.TranscriptionStatus === 'completed') return 'transcription.completed';
    return 'unknown';
  }

  private mapBandwidthEventType(payload: any): string {
    if (payload.state === 'completed') return 'recording.completed';
    if (payload.state === 'error') return 'recording.failed';
    return 'unknown';
  }

  private mapSmsItEventType(payload: any): string {
    if (payload.event_type === 'recording_completed') return 'recording.completed';
    if (payload.event_type === 'recording_failed') return 'recording.failed';
    if (payload.event_type === 'call_ended') return 'call.ended';
    return 'unknown';
  }

  // Signature validation methods
  private validateTwilioSignature(payload: any, signature: string): boolean {
    // Implement Twilio signature validation
    // const expectedSignature = crypto.createHmac('sha1', this.webhookConfigs.get('twilio')!.secret)...
    return true; // Simplified for demo
  }

  private validateSignalWireSignature(payload: any, signature: string): boolean {
    // Implement SignalWire signature validation
    return true; // Simplified for demo
  }

  // Helper methods
  private async storeWebhookEvent(event: WebhookEvent): Promise<void> {
    // Store event in database for audit trail
    console.log('Storing webhook event:', event.id);
  }

  private async handleWebhookError(event: WebhookEvent, error: any): Promise<void> {
    // Log error and potentially retry
    console.error('Webhook processing error:', error);
  }

  private calculateQualityFromProvider(data: RecordingWebhookData): string {
    // Calculate quality based on provider-specific metrics
    return 'Good'; // Simplified
  }

  private async triggerQualityAnalysis(recording: any): Promise<void> {
    // Trigger AI quality analysis
    console.log('Triggering quality analysis for:', recording.id);
  }

  private async requestTranscription(recording: any): Promise<void> {
    // Request transcription from provider or third-party service
    console.log('Requesting transcription for:', recording.id);
  }

  private async notifyRecordingFailure(data: RecordingWebhookData): Promise<void> {
    // Send notifications about recording failures
    console.log('Recording failure notification:', data.recordingId);
  }

  private async updateRecordingTranscription(recordingId: string, transcription: string): Promise<void> {
    // Update recording with transcription
    console.log('Updating transcription for:', recordingId);
  }

  private async analyzeSentiment(recordingId: string, transcription: string): Promise<void> {
    // Analyze sentiment of transcription
    console.log('Analyzing sentiment for:', recordingId);
  }

  private async detectKeywords(recordingId: string, transcription: string): Promise<void> {
    // Detect keywords in transcription
    console.log('Detecting keywords for:', recordingId);
  }

  private async monitorRecordingStatus(callId: string): Promise<void> {
    // Monitor recording status after call ends
    console.log('Monitoring recording status for call:', callId);
  }

  /**
   * Get webhook configuration for a provider
   */
  getWebhookConfig(provider: string): WebhookConfig | undefined {
    return this.webhookConfigs.get(provider);
  }

  /**
   * Update webhook configuration for a provider
   */
  updateWebhookConfig(provider: string, config: Partial<WebhookConfig>): void {
    const existing = this.webhookConfigs.get(provider);
    if (existing) {
      this.webhookConfigs.set(provider, { ...existing, ...config });
    }
  }

  /**
   * Get all supported providers
   */
  getSupportedProviders(): string[] {
    return Array.from(this.webhookConfigs.keys());
  }
}

// Export singleton instance
export const recordingWebhookService = new RecordingWebhookService();
