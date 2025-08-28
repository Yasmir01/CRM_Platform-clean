/**
 * Comprehensive Activity Tracking Service for CRM
 * Automatically tracks and logs all changes made to entities
 */

export interface ActivityEvent {
  id: string;
  timestamp: Date;
  userId: string;
  userDisplayName: string;
  action: 'create' | 'update' | 'delete' | 'move' | 'status_change' | 'payment' | 'communication' | 'maintenance';
  entityType: 'property' | 'tenant' | 'lease' | 'task' | 'payment' | 'workorder' | 'prospect' | 'application' | 'document';
  entityId: string;
  entityName: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
    displayName: string;
  }[];
  description: string;
  metadata?: {
    relatedEntityType?: string;
    relatedEntityId?: string;
    relatedEntityName?: string;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    notes?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'financial' | 'operational' | 'maintenance' | 'legal' | 'communication' | 'system';
}

export interface ActivityFilter {
  entityType?: string;
  entityId?: string;
  userId?: string;
  action?: string;
  dateFrom?: Date;
  dateTo?: Date;
  severity?: string;
  category?: string;
}

class ActivityTrackingService {
  private activities: ActivityEvent[] = [];
  private listeners: ((activity: ActivityEvent) => void)[] = [];

  /**
   * Track a new activity event
   */
  trackActivity(activity: Omit<ActivityEvent, 'id' | 'timestamp'>): ActivityEvent {
    const activityEvent: ActivityEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      ...activity,
    };

    this.activities.unshift(activityEvent);
    
    // Notify listeners
    this.listeners.forEach(listener => listener(activityEvent));
    
    // Store in localStorage for persistence
    this.persistActivities();
    
    console.log('Activity tracked:', activityEvent);
    return activityEvent;
  }

  /**
   * Track property-related activities
   */
  trackPropertyActivity(action: ActivityEvent['action'], propertyId: string, propertyName: string, changes: ActivityEvent['changes'], description: string, metadata?: ActivityEvent['metadata']) {
    return this.trackActivity({
      userId: this.getCurrentUserId(),
      userDisplayName: this.getCurrentUserName(),
      action,
      entityType: 'property',
      entityId: propertyId,
      entityName: propertyName,
      changes,
      description,
      metadata: {
        ...metadata,
        ipAddress: this.getClientIP(),
        userAgent: navigator.userAgent,
      },
      severity: this.determineSeverity(action, changes),
      category: this.determineCategory(action, changes),
    });
  }

  /**
   * Track tenant-related activities
   */
  trackTenantActivity(action: ActivityEvent['action'], tenantId: string, tenantName: string, changes: ActivityEvent['changes'], description: string, metadata?: ActivityEvent['metadata']) {
    return this.trackActivity({
      userId: this.getCurrentUserId(),
      userDisplayName: this.getCurrentUserName(),
      action,
      entityType: 'tenant',
      entityId: tenantId,
      entityName: tenantName,
      changes,
      description,
      metadata: {
        ...metadata,
        ipAddress: this.getClientIP(),
        userAgent: navigator.userAgent,
      },
      severity: this.determineSeverity(action, changes),
      category: this.determineCategory(action, changes),
    });
  }

  /**
   * Track lease-related activities including tenant moves
   */
  trackLeaseActivity(action: ActivityEvent['action'], leaseId: string, leaseName: string, changes: ActivityEvent['changes'], description: string, metadata?: ActivityEvent['metadata']) {
    return this.trackActivity({
      userId: this.getCurrentUserId(),
      userDisplayName: this.getCurrentUserName(),
      action,
      entityType: 'lease',
      entityId: leaseId,
      entityName: leaseName,
      changes,
      description,
      metadata: {
        ...metadata,
        ipAddress: this.getClientIP(),
        userAgent: navigator.userAgent,
      },
      severity: this.determineSeverity(action, changes),
      category: 'legal',
    });
  }

  /**
   * Track deposit transfers between properties
   */
  trackDepositTransfer(fromPropertyId: string, fromPropertyName: string, toPropertyId: string, toPropertyName: string, tenantId: string, tenantName: string, amount: number) {
    const description = `Deposit transfer of $${amount.toLocaleString()} from ${fromPropertyName} to ${toPropertyName} for tenant ${tenantName}`;
    
    // Track on both properties
    this.trackActivity({
      userId: this.getCurrentUserId(),
      userDisplayName: this.getCurrentUserName(),
      action: 'move',
      entityType: 'property',
      entityId: fromPropertyId,
      entityName: fromPropertyName,
      changes: [
        {
          field: 'security_deposit',
          oldValue: amount,
          newValue: 0,
          displayName: 'Security Deposit'
        }
      ],
      description: `${description} (Outgoing)`,
      metadata: {
        relatedEntityType: 'property',
        relatedEntityId: toPropertyId,
        relatedEntityName: toPropertyName,
        ipAddress: this.getClientIP(),
        userAgent: navigator.userAgent,
        notes: `Tenant move: ${tenantName} (ID: ${tenantId})`
      },
      severity: 'medium',
      category: 'financial',
    });

    this.trackActivity({
      userId: this.getCurrentUserId(),
      userDisplayName: this.getCurrentUserName(),
      action: 'move',
      entityType: 'property',
      entityId: toPropertyId,
      entityName: toPropertyName,
      changes: [
        {
          field: 'security_deposit',
          oldValue: 0,
          newValue: amount,
          displayName: 'Security Deposit'
        }
      ],
      description: `${description} (Incoming)`,
      metadata: {
        relatedEntityType: 'property',
        relatedEntityId: fromPropertyId,
        relatedEntityName: fromPropertyName,
        ipAddress: this.getClientIP(),
        userAgent: navigator.userAgent,
        notes: `Tenant move: ${tenantName} (ID: ${tenantId})`
      },
      severity: 'medium',
      category: 'financial',
    });

    // Track on tenant record
    this.trackTenantActivity('move', tenantId, tenantName, [
      {
        field: 'property',
        oldValue: fromPropertyName,
        newValue: toPropertyName,
        displayName: 'Property Assignment'
      }
    ], description, {
      relatedEntityType: 'property',
      relatedEntityId: toPropertyId,
      relatedEntityName: toPropertyName,
      notes: `Deposit transferred: $${amount.toLocaleString()}`
    });
  }

  /**
   * Track payment activities
   */
  trackPaymentActivity(paymentId: string, tenantId: string, tenantName: string, propertyId: string, propertyName: string, amount: number, type: string, status: string) {
    return this.trackActivity({
      userId: this.getCurrentUserId(),
      userDisplayName: this.getCurrentUserName(),
      action: 'payment',
      entityType: 'payment',
      entityId: paymentId,
      entityName: `${type} Payment - ${tenantName}`,
      changes: [
        {
          field: 'payment_status',
          oldValue: 'pending',
          newValue: status,
          displayName: 'Payment Status'
        },
        {
          field: 'amount',
          oldValue: 0,
          newValue: amount,
          displayName: 'Amount'
        }
      ],
      description: `${type} payment of $${amount.toLocaleString()} ${status} for ${tenantName} at ${propertyName}`,
      metadata: {
        relatedEntityType: 'tenant',
        relatedEntityId: tenantId,
        relatedEntityName: tenantName,
        ipAddress: this.getClientIP(),
        userAgent: navigator.userAgent,
        notes: `Property: ${propertyName} (${propertyId})`
      },
      severity: amount > 5000 ? 'high' : 'medium',
      category: 'financial',
    });
  }

  /**
   * Get activities with optional filtering
   */
  getActivities(filter?: ActivityFilter): ActivityEvent[] {
    let filtered = [...this.activities];

    if (filter) {
      if (filter.entityType) {
        filtered = filtered.filter(a => a.entityType === filter.entityType);
      }
      if (filter.entityId) {
        filtered = filtered.filter(a => a.entityId === filter.entityId);
      }
      if (filter.userId) {
        filtered = filtered.filter(a => a.userId === filter.userId);
      }
      if (filter.action) {
        filtered = filtered.filter(a => a.action === filter.action);
      }
      if (filter.dateFrom) {
        filtered = filtered.filter(a => a.timestamp >= filter.dateFrom!);
      }
      if (filter.dateTo) {
        filtered = filtered.filter(a => a.timestamp <= filter.dateTo!);
      }
      if (filter.severity) {
        filtered = filtered.filter(a => a.severity === filter.severity);
      }
      if (filter.category) {
        filtered = filtered.filter(a => a.category === filter.category);
      }
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get activities for a specific entity
   */
  getEntityActivities(entityType: string, entityId: string): ActivityEvent[] {
    return this.getActivities({ entityType, entityId });
  }

  /**
   * Subscribe to activity events
   */
  subscribe(listener: (activity: ActivityEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Generate audit report
   */
  generateAuditReport(filter?: ActivityFilter): {
    activities: ActivityEvent[];
    summary: {
      totalActivities: number;
      criticalEvents: number;
      financialTransactions: number;
      systemChanges: number;
      dateRange: { from: Date; to: Date };
    };
  } {
    const activities = this.getActivities(filter);
    
    return {
      activities,
      summary: {
        totalActivities: activities.length,
        criticalEvents: activities.filter(a => a.severity === 'critical').length,
        financialTransactions: activities.filter(a => a.category === 'financial').length,
        systemChanges: activities.filter(a => a.action === 'update').length,
        dateRange: {
          from: activities.length > 0 ? activities[activities.length - 1].timestamp : new Date(),
          to: activities.length > 0 ? activities[0].timestamp : new Date(),
        },
      },
    };
  }

  // Private helper methods
  private generateId(): string {
    return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUserId(): string {
    // In a real application, this would get the current user from auth context
    return 'user_123';
  }

  private getCurrentUserName(): string {
    // In a real application, this would get the current user from auth context
    return 'Alex Thompson';
  }

  private getClientIP(): string {
    // In a real application, this would get the client IP
    return '192.168.1.100';
  }

  private determineSeverity(action: ActivityEvent['action'], changes: ActivityEvent['changes']): ActivityEvent['severity'] {
    if (action === 'delete') return 'high';
    if (action === 'move') return 'medium';

    // Safety check: ensure changes is defined and is an array
    if (!changes || !Array.isArray(changes)) {
      return 'low';
    }

    const hasFinancialChange = changes.some(c =>
      c.field.toLowerCase().includes('rent') ||
      c.field.toLowerCase().includes('deposit') ||
      c.field.toLowerCase().includes('payment')
    );

    if (hasFinancialChange) return 'medium';
    return 'low';
  }

  private determineCategory(action: ActivityEvent['action'], changes: ActivityEvent['changes']): ActivityEvent['category'] {
    if (action === 'payment') return 'financial';
    if (action === 'maintenance') return 'maintenance';
    if (action === 'communication') return 'communication';
    
    const hasFinancialChange = changes.some(c => 
      c.field.toLowerCase().includes('rent') || 
      c.field.toLowerCase().includes('deposit') || 
      c.field.toLowerCase().includes('payment')
    );
    
    if (hasFinancialChange) return 'financial';
    
    const hasMaintenanceChange = changes.some(c => 
      c.field.toLowerCase().includes('maintenance') || 
      c.field.toLowerCase().includes('repair')
    );
    
    if (hasMaintenanceChange) return 'maintenance';
    
    return 'operational';
  }

  private persistActivities(): void {
    try {
      // Keep only last 1000 activities to prevent localStorage overflow
      const activitiesToStore = this.activities.slice(0, 1000);
      localStorage.setItem('crm_activities', JSON.stringify(activitiesToStore));
    } catch (error) {
      console.warn('Could not persist activities to localStorage:', error);
    }
  }

  private loadActivities(): void {
    try {
      const stored = localStorage.getItem('crm_activities');
      if (stored) {
        const activities = JSON.parse(stored);
        this.activities = activities.map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Could not load activities from localStorage:', error);
    }
  }

  constructor() {
    this.loadActivities();
  }
}

// Export singleton instance
export const activityTracker = new ActivityTrackingService();
export default activityTracker;
