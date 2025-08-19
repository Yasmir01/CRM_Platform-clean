import { LocalStorageService } from './LocalStorageService';

// Backup configuration based on subscription levels
export type SubscriptionLevel = 'Starter' | 'Professional' | 'Enterprise';

export interface BackupFrequency {
  type: 'manual' | 'weekly' | 'daily' | 'biweekly';
  dayOfWeek?: number; // 0-6 for weekly/biweekly
  hour?: number; // 0-23 for daily
}

export interface BackupMetadata {
  id: string;
  timestamp: string;
  version: string;
  subscriptionLevel: SubscriptionLevel;
  size: number;
  checksum: string;
  createdBy: string;
  description?: string;
  frequency: BackupFrequency;
  expiryDate: string; // 14 days from creation
  encrypted: boolean;
  entities: string[]; // List of entity types included
}

export interface BackupData {
  metadata: BackupMetadata;
  entities: {
    properties: any[];
    tenants: any[];
    propertyManagers: any[];
    contacts: any[];
    deals: any[];
    quotes: any[];
    campaigns: any[];
    propertyGroups: any[];
    workOrders: any[];
    notes: any[];
    announcements: any[];
    documents: any[];
    payments: any[];
    subscriptionPlans: any[];
    marketplaceItems: any[];
  };
  associations?: {
    propertyTenants: Record<string, string[]>;
    managerProperties: Record<string, string[]>;
    dealContacts: Record<string, string>;
  };
}

export interface RestoreOptions {
  overwriteExisting: boolean;
  selectedEntities: string[];
  createBackupBeforeRestore: boolean;
  skipValidation: boolean;
}

export interface BackupSchedule {
  id: string;
  frequency: BackupFrequency;
  enabled: boolean;
  nextRun: string;
  lastRun?: string;
  subscriptionLevel: SubscriptionLevel;
  retentionDays: number;
  autoCleanup: boolean;
}

export class BackupRestoreService {
  private static readonly BACKUP_PREFIX = 'backup_';
  private static readonly SCHEDULE_KEY = 'backup_schedules';
  private static readonly VERSION = '1.0.0';
  
  // Subscription-based backup limits
  private static readonly SUBSCRIPTION_LIMITS = {
    Starter: {
      maxBackups: 5,
      retentionDays: 14,
      allowedFrequencies: ['manual', 'weekly'],
      dailyBackups: false
    },
    Professional: {
      maxBackups: 10,
      retentionDays: 14,
      allowedFrequencies: ['manual', 'weekly'],
      dailyBackups: false
    },
    Enterprise: {
      maxBackups: 50,
      retentionDays: 30,
      allowedFrequencies: ['manual', 'weekly', 'daily', 'biweekly'],
      dailyBackups: true
    }
  };

  // Create a comprehensive backup
  static async createBackup(
    description?: string,
    subscriptionLevel: SubscriptionLevel = 'Professional',
    frequency: BackupFrequency = { type: 'manual' },
    createdBy: string = 'system'
  ): Promise<BackupMetadata> {
    try {
      // Load all current data
      const allData = LocalStorageService.loadAllData();
      
      // Get additional data from CRM context
      const properties = LocalStorageService.getProperties();
      const tenants = LocalStorageService.getTenants();
      const managers = LocalStorageService.getManagers();
      const contacts = LocalStorageService.getContacts();
      const workOrders = LocalStorageService.getWorkOrders();
      const announcements = LocalStorageService.getAnnouncements();
      const news = LocalStorageService.getNews();
      
      // Create backup ID
      const backupId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Prepare entities data
      const entities = {
        properties: properties,
        tenants: tenants,
        propertyManagers: managers,
        contacts: contacts,
        deals: allData.deals || [],
        quotes: allData.quotes || [],
        campaigns: allData.campaigns || [],
        propertyGroups: allData.propertyGroups || [],
        workOrders: workOrders,
        notes: news, // Notes are stored as news in localStorage
        announcements: announcements,
        documents: allData.documents || [],
        payments: allData.payments || [],
        subscriptionPlans: allData.subscriptionPlans || [],
        marketplaceItems: allData.marketplaceItems || []
      };

      // Create associations (relationships between entities)
      const associations = this.createAssociations(entities);

      // Calculate size and checksum
      const dataString = JSON.stringify({ entities, associations });
      const size = new Blob([dataString]).size;
      const checksum = await this.calculateChecksum(dataString);

      // Create metadata
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 14); // 14 days retention
      
      const metadata: BackupMetadata = {
        id: backupId,
        timestamp: new Date().toISOString(),
        version: this.VERSION,
        subscriptionLevel,
        size,
        checksum,
        createdBy,
        description: description || `Backup created on ${new Date().toLocaleDateString()}`,
        frequency,
        expiryDate: expiryDate.toISOString(),
        encrypted: true,
        entities: Object.keys(entities).filter(key => entities[key as keyof typeof entities].length > 0)
      };

      // Create backup data
      const backupData: BackupData = {
        metadata,
        entities,
        associations
      };

      // Encrypt and store backup
      const encryptedData = await this.encryptBackup(backupData);
      LocalStorageService.setItem(`${this.BACKUP_PREFIX}${backupId}`, encryptedData);

      // Update backup registry
      this.updateBackupRegistry(metadata);

      // Cleanup old backups based on subscription limits
      await this.cleanupOldBackups(subscriptionLevel);

      console.log(`Backup created successfully: ${backupId}`);
      return metadata;

    } catch (error) {
      console.error('Error creating backup:', error);
      throw new Error('Failed to create backup. Please try again.');
    }
  }

  // Restore data from backup
  static async restoreFromBackup(
    backupId: string,
    options: RestoreOptions,
    authToken?: string
  ): Promise<boolean> {
    try {
      // Verify two-factor authentication
      if (!authToken || !await this.verifyAuthToken(authToken)) {
        throw new Error('Two-factor authentication required for data restoration');
      }

      // Load backup data
      const encryptedBackup = LocalStorageService.getItem(`${this.BACKUP_PREFIX}${backupId}`, null);
      if (!encryptedBackup) {
        throw new Error('Backup not found or has expired');
      }

      // Decrypt backup
      const backupData: BackupData = await this.decryptBackup(encryptedBackup);

      // Validate backup integrity
      if (!options.skipValidation && !await this.validateBackup(backupData)) {
        throw new Error('Backup validation failed. Data may be corrupted.');
      }

      // Create backup before restore if requested
      if (options.createBackupBeforeRestore) {
        await this.createBackup(
          `Pre-restore backup (${new Date().toLocaleDateString()})`,
          'Professional',
          { type: 'manual' },
          'restore-system'
        );
      }

      // Restore selected entities
      await this.performRestore(backupData, options);

      console.log(`Data restored successfully from backup: ${backupId}`);
      return true;

    } catch (error) {
      console.error('Error restoring from backup:', error);
      throw error;
    }
  }

  // Get all available backups
  static getBackupList(): BackupMetadata[] {
    const registry = LocalStorageService.getItem('backup_registry', []);
    
    // Filter out expired backups
    const now = new Date();
    return registry.filter((backup: BackupMetadata) => 
      new Date(backup.expiryDate) > now
    ).sort((a: BackupMetadata, b: BackupMetadata) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // Delete a specific backup
  static deleteBackup(backupId: string): boolean {
    try {
      LocalStorageService.removeItem(`${this.BACKUP_PREFIX}${backupId}`);
      
      // Update registry
      const registry = LocalStorageService.getItem('backup_registry', []);
      const updatedRegistry = registry.filter((backup: BackupMetadata) => backup.id !== backupId);
      LocalStorageService.setItem('backup_registry', updatedRegistry);

      return true;
    } catch (error) {
      console.error('Error deleting backup:', error);
      return false;
    }
  }

  // Export backup as downloadable file
  static async exportBackup(backupId: string): Promise<Blob> {
    try {
      const backup = LocalStorageService.getItem(`${this.BACKUP_PREFIX}${backupId}`, null);
      if (!backup) {
        throw new Error('Backup not found');
      }

      // Create ZIP-like structure with CSV files for each entity
      const zipData = await this.createBackupZip(backup);
      return new Blob([zipData], { type: 'application/zip' });

    } catch (error) {
      console.error('Error exporting backup:', error);
      throw error;
    }
  }

  // Schedule automatic backups
  static createBackupSchedule(
    frequency: BackupFrequency,
    subscriptionLevel: SubscriptionLevel,
    enabled: boolean = true
  ): string {
    const limits = this.SUBSCRIPTION_LIMITS[subscriptionLevel];
    
    // Validate frequency is allowed for subscription level
    if (!limits.allowedFrequencies.includes(frequency.type)) {
      throw new Error(`${frequency.type} backups not available for ${subscriptionLevel} subscription`);
    }

    const scheduleId = `schedule_${Date.now()}`;
    const nextRun = this.calculateNextRun(frequency);

    const schedule: BackupSchedule = {
      id: scheduleId,
      frequency,
      enabled,
      nextRun: nextRun.toISOString(),
      subscriptionLevel,
      retentionDays: limits.retentionDays,
      autoCleanup: true
    };

    // Save schedule
    const schedules = LocalStorageService.getItem(this.SCHEDULE_KEY, []);
    schedules.push(schedule);
    LocalStorageService.setItem(this.SCHEDULE_KEY, schedules);

    return scheduleId;
  }

  // Get backup schedules
  static getBackupSchedules(): BackupSchedule[] {
    return LocalStorageService.getItem(this.SCHEDULE_KEY, []);
  }

  // Update backup schedule
  static updateBackupSchedule(scheduleId: string, updates: Partial<BackupSchedule>): boolean {
    try {
      const schedules = LocalStorageService.getItem(this.SCHEDULE_KEY, []);
      const index = schedules.findIndex((s: BackupSchedule) => s.id === scheduleId);
      
      if (index === -1) return false;

      schedules[index] = { ...schedules[index], ...updates };
      LocalStorageService.setItem(this.SCHEDULE_KEY, schedules);
      
      return true;
    } catch (error) {
      console.error('Error updating backup schedule:', error);
      return false;
    }
  }

  // Private helper methods
  private static createAssociations(entities: any) {
    return {
      propertyTenants: entities.tenants.reduce((acc: Record<string, string[]>, tenant: any) => {
        if (tenant.propertyId) {
          if (!acc[tenant.propertyId]) acc[tenant.propertyId] = [];
          acc[tenant.propertyId].push(tenant.id);
        }
        return acc;
      }, {}),
      managerProperties: entities.propertyManagers.reduce((acc: Record<string, string[]>, manager: any) => {
        acc[manager.id] = manager.propertyIds || [];
        return acc;
      }, {}),
      dealContacts: entities.deals.reduce((acc: Record<string, string>, deal: any) => {
        if (deal.contactId) {
          acc[deal.id] = deal.contactId;
        }
        return acc;
      }, {})
    };
  }

  private static async calculateChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private static async encryptBackup(data: BackupData): Promise<string> {
    // Simple encryption for demo - in production, use proper encryption
    const dataString = JSON.stringify(data);
    return btoa(dataString);
  }

  private static async decryptBackup(encryptedData: string): Promise<BackupData> {
    // Simple decryption for demo - in production, use proper decryption
    const dataString = atob(encryptedData);
    return JSON.parse(dataString);
  }

  private static async verifyAuthToken(token: string): Promise<boolean> {
    // In production, this would verify with your auth service
    // For demo, we'll simulate a valid token check
    return token && token.length > 0;
  }

  private static async validateBackup(backupData: BackupData): Promise<boolean> {
    try {
      // Validate structure
      if (!backupData.metadata || !backupData.entities) return false;
      
      // Validate checksum
      const dataString = JSON.stringify({ 
        entities: backupData.entities, 
        associations: backupData.associations 
      });
      const calculatedChecksum = await this.calculateChecksum(dataString);
      
      return calculatedChecksum === backupData.metadata.checksum;
    } catch (error) {
      return false;
    }
  }

  private static async performRestore(backupData: BackupData, options: RestoreOptions): Promise<void> {
    const { entities } = backupData;
    
    // Restore selected entities
    options.selectedEntities.forEach(entityType => {
      switch (entityType) {
        case 'properties':
          if (options.overwriteExisting) {
            LocalStorageService.saveProperties(entities.properties);
          } else {
            const existing = LocalStorageService.getProperties();
            const merged = this.mergeEntities(existing, entities.properties);
            LocalStorageService.saveProperties(merged);
          }
          break;
        case 'tenants':
          if (options.overwriteExisting) {
            LocalStorageService.saveTenants(entities.tenants);
          } else {
            const existing = LocalStorageService.getTenants();
            const merged = this.mergeEntities(existing, entities.tenants);
            LocalStorageService.saveTenants(merged);
          }
          break;
        case 'propertyManagers':
          if (options.overwriteExisting) {
            LocalStorageService.saveManagers(entities.propertyManagers);
          } else {
            const existing = LocalStorageService.getManagers();
            const merged = this.mergeEntities(existing, entities.propertyManagers);
            LocalStorageService.saveManagers(merged);
          }
          break;
        case 'contacts':
          if (options.overwriteExisting) {
            LocalStorageService.saveContacts(entities.contacts);
          } else {
            const existing = LocalStorageService.getContacts();
            const merged = this.mergeEntities(existing, entities.contacts);
            LocalStorageService.saveContacts(merged);
          }
          break;
        case 'workOrders':
          if (options.overwriteExisting) {
            LocalStorageService.saveWorkOrders(entities.workOrders);
          } else {
            const existing = LocalStorageService.getWorkOrders();
            const merged = this.mergeEntities(existing, entities.workOrders);
            LocalStorageService.saveWorkOrders(merged);
          }
          break;
        case 'announcements':
          if (options.overwriteExisting) {
            LocalStorageService.saveAnnouncements(entities.announcements);
          } else {
            const existing = LocalStorageService.getAnnouncements();
            const merged = this.mergeEntities(existing, entities.announcements);
            LocalStorageService.saveAnnouncements(merged);
          }
          break;
        case 'notes':
          if (options.overwriteExisting) {
            LocalStorageService.saveNews(entities.notes);
          } else {
            const existing = LocalStorageService.getNews();
            const merged = this.mergeEntities(existing, entities.notes);
            LocalStorageService.saveNews(merged);
          }
          break;
      }
    });
  }

  private static mergeEntities(existing: any[], backup: any[]): any[] {
    const existingIds = new Set(existing.map(item => item.id));
    const newItems = backup.filter(item => !existingIds.has(item.id));
    return [...existing, ...newItems];
  }

  private static updateBackupRegistry(metadata: BackupMetadata): void {
    const registry = LocalStorageService.getItem('backup_registry', []);
    registry.push(metadata);
    LocalStorageService.setItem('backup_registry', registry);
  }

  private static async cleanupOldBackups(subscriptionLevel: SubscriptionLevel): Promise<void> {
    const limits = this.SUBSCRIPTION_LIMITS[subscriptionLevel];
    const registry = LocalStorageService.getItem('backup_registry', []);
    
    // Sort by timestamp (newest first)
    const sortedBackups = registry.sort((a: BackupMetadata, b: BackupMetadata) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Remove excess backups
    if (sortedBackups.length > limits.maxBackups) {
      const toDelete = sortedBackups.slice(limits.maxBackups);
      toDelete.forEach((backup: BackupMetadata) => {
        LocalStorageService.removeItem(`${this.BACKUP_PREFIX}${backup.id}`);
      });
      
      // Update registry
      const updatedRegistry = sortedBackups.slice(0, limits.maxBackups);
      LocalStorageService.setItem('backup_registry', updatedRegistry);
    }

    // Remove expired backups
    const now = new Date();
    const validBackups = sortedBackups.filter((backup: BackupMetadata) => {
      const isExpired = new Date(backup.expiryDate) <= now;
      if (isExpired) {
        LocalStorageService.removeItem(`${this.BACKUP_PREFIX}${backup.id}`);
      }
      return !isExpired;
    });

    if (validBackups.length !== sortedBackups.length) {
      LocalStorageService.setItem('backup_registry', validBackups);
    }
  }

  private static calculateNextRun(frequency: BackupFrequency): Date {
    const now = new Date();
    const nextRun = new Date(now);

    switch (frequency.type) {
      case 'daily':
        nextRun.setDate(now.getDate() + 1);
        if (frequency.hour !== undefined) {
          nextRun.setHours(frequency.hour, 0, 0, 0);
        }
        break;
      case 'weekly':
        const daysUntilNext = (7 + (frequency.dayOfWeek || 0) - now.getDay()) % 7;
        nextRun.setDate(now.getDate() + (daysUntilNext || 7));
        nextRun.setHours(frequency.hour || 2, 0, 0, 0);
        break;
      case 'biweekly':
        const daysUntilNextBiweekly = (14 + (frequency.dayOfWeek || 0) - now.getDay()) % 14;
        nextRun.setDate(now.getDate() + (daysUntilNextBiweekly || 14));
        nextRun.setHours(frequency.hour || 2, 0, 0, 0);
        break;
      default:
        // Manual - no next run
        nextRun.setFullYear(9999);
    }

    return nextRun;
  }

  private static async createBackupZip(backupData: any): Promise<string> {
    // Simplified CSV export for demo
    // In production, use a proper ZIP library
    const csvData = {
      'properties.csv': this.convertToCSV(backupData.entities?.properties || []),
      'tenants.csv': this.convertToCSV(backupData.entities?.tenants || []),
      'contacts.csv': this.convertToCSV(backupData.entities?.contacts || []),
      'metadata.json': JSON.stringify(backupData.metadata, null, 2)
    };

    return JSON.stringify(csvData);
  }

  private static convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => 
      Object.values(item).map(value => 
        typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : String(value || '')
      ).join(',')
    );

    return [headers, ...rows].join('\n');
  }
}
