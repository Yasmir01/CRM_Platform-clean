import { LocalStorageService } from './LocalStorageService';
import activityTracker from './ActivityTrackingService';

interface MaintenanceTemplate {
  id: string;
  name: string;
  description: string;
  category: 'hvac' | 'plumbing' | 'electrical' | 'structural' | 'landscaping' | 'appliances' | 'safety' | 'general';
  type: 'inspection' | 'cleaning' | 'replacement' | 'service' | 'testing' | 'calibration';
  frequency: MaintenanceFrequency;
  estimatedDuration: number; // minutes
  estimatedCost: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  checklist: MaintenanceChecklistItem[];
  requiredSkills: string[];
  requiredTools: string[];
  seasonalRestrictions?: SeasonalRestriction;
  weatherDependency: boolean;
  safetyRequirements: SafetyRequirement[];
  complianceRequirements: ComplianceRequirement[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface MaintenanceFrequency {
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semi_annually' | 'annually' | 'custom';
  interval?: number; // for custom frequency
  intervalUnit?: 'days' | 'weeks' | 'months' | 'years';
  specificDays?: number[]; // day of week (0-6) or day of month (1-31)
  specificMonths?: number[]; // month (1-12)
  excludeWeekends?: boolean;
  excludeHolidays?: boolean;
}

interface MaintenanceChecklistItem {
  id: string;
  description: string;
  type: 'visual_inspection' | 'measurement' | 'test' | 'cleaning' | 'replacement' | 'adjustment' | 'documentation';
  isRequired: boolean;
  expectedValue?: string;
  toleranceRange?: {
    min: number;
    max: number;
    unit: string;
  };
  instructions?: string;
  photos?: {
    before: boolean;
    after: boolean;
    required: boolean;
  };
}

interface SeasonalRestriction {
  seasons: ('spring' | 'summer' | 'fall' | 'winter')[];
  description: string;
}

interface SafetyRequirement {
  id: string;
  requirement: string;
  type: 'ppe' | 'procedure' | 'training' | 'certification';
  isMandatory: boolean;
}

interface ComplianceRequirement {
  id: string;
  standard: string; // e.g., "OSHA", "Local Building Code", "Manufacturer Warranty"
  requirement: string;
  frequency?: string;
  expirationTracking: boolean;
}

interface MaintenanceSchedule {
  id: string;
  templateId: string;
  propertyId: string;
  assetId?: string; // specific equipment/asset
  title: string;
  description: string;
  scheduledDate: string;
  estimatedCompletionDate: string;
  actualStartDate?: string;
  actualCompletionDate?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue' | 'rescheduled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string[];
  assignedTeam?: string;
  estimatedCost: number;
  actualCost?: number;
  recurrence: MaintenanceRecurrence;
  notifications: MaintenanceNotification[];
  completionData?: MaintenanceCompletion;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface MaintenanceRecurrence {
  enabled: boolean;
  nextScheduledDate?: string;
  lastCompletedDate?: string;
  skipCount: number; // times skipped
  endDate?: string; // when to stop recurring
  maxOccurrences?: number;
}

interface MaintenanceNotification {
  id: string;
  type: 'due_soon' | 'overdue' | 'completion_required' | 'rescheduled' | 'cancelled';
  recipientType: 'assignee' | 'property_manager' | 'tenant' | 'owner' | 'custom';
  recipients: string[];
  scheduledDate: string;
  sentDate?: string;
  method: 'email' | 'sms' | 'push' | 'in_app';
  message: string;
  isActive: boolean;
}

interface MaintenanceCompletion {
  completedBy: string;
  completionDate: string;
  checklist: CompletedChecklistItem[];
  notes: string;
  photos: string[];
  costsBreakdown: CostBreakdown[];
  timeSpent: number; // minutes
  followUpRequired: boolean;
  followUpNotes?: string;
  nextMaintenanceDate?: string;
  warrantyInfo?: WarrantyInfo;
  qualityRating: number; // 1-5
  customerSatisfaction?: number; // 1-5
}

interface CompletedChecklistItem {
  checklistItemId: string;
  completed: boolean;
  value?: string;
  notes?: string;
  photos?: string[];
  requiresFollowUp: boolean;
}

interface CostBreakdown {
  description: string;
  category: 'labor' | 'materials' | 'equipment' | 'travel' | 'other';
  quantity: number;
  unitCost: number;
  totalCost: number;
  vendor?: string;
  receiptUrl?: string;
}

interface WarrantyInfo {
  provider: string;
  warrantyPeriod: number; // months
  warrantyType: 'parts' | 'labor' | 'full';
  warrantyNumber?: string;
  expirationDate: string;
}

interface MaintenanceAsset {
  id: string;
  propertyId: string;
  name: string;
  type: string;
  category: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  installationDate?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  warrantyExpiration?: string;
  location: string;
  specifications: Record<string, any>;
  maintenanceHistory: string[]; // schedule IDs
  documents: string[]; // document IDs
  isActive: boolean;
  criticalityLevel: 'low' | 'medium' | 'high' | 'critical';
  replacementCost: number;
  createdAt: string;
  updatedAt: string;
}

interface MaintenanceCalendar {
  date: string;
  schedules: MaintenanceSchedule[];
  workload: {
    totalTasks: number;
    estimatedHours: number;
    estimatedCost: number;
    criticalTasks: number;
  };
  availability: {
    availableSlots: number;
    bookedSlots: number;
    overbooked: boolean;
  };
}

interface MaintenanceReport {
  id: string;
  type: 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom';
  period: {
    startDate: string;
    endDate: string;
  };
  metrics: {
    totalScheduled: number;
    totalCompleted: number;
    totalOverdue: number;
    completionRate: number;
    averageCompletionTime: number; // hours
    totalCost: number;
    costVariance: number; // actual vs estimated
    assetUptime: number; // percentage
    emergencyCallouts: number;
    tenantSatisfaction: number; // average rating
  };
  costAnalysis: {
    totalSpent: number;
    laborCosts: number;
    materialCosts: number;
    equipmentCosts: number;
    categoryBreakdown: Record<string, number>;
    vendorBreakdown: Record<string, number>;
  };
  recommendations: MaintenanceRecommendation[];
  generatedAt: string;
  generatedBy: string;
}

interface MaintenanceRecommendation {
  type: 'cost_optimization' | 'schedule_adjustment' | 'asset_replacement' | 'training_needed' | 'process_improvement';
  priority: 'low' | 'medium' | 'high';
  description: string;
  expectedSavings?: number;
  implementationEffort: 'low' | 'medium' | 'high';
  timeline: string;
}

export class PreventiveMaintenanceService {
  private templates: Map<string, MaintenanceTemplate> = new Map();
  private schedules: Map<string, MaintenanceSchedule> = new Map();
  private assets: Map<string, MaintenanceAsset> = new Map();
  private notifications: MaintenanceNotification[] = [];
  private schedulingInterval: NodeJS.Timeout | null = null;
  private notificationInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadData();
    this.initializeDefaultTemplates();
    this.startSchedulingEngine();
    this.startNotificationEngine();
  }

  /**
   * Create a new maintenance template
   */
  createTemplate(template: Omit<MaintenanceTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): MaintenanceTemplate {
    const maintenanceTemplate: MaintenanceTemplate = {
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current_user',
      ...template
    };

    this.templates.set(maintenanceTemplate.id, maintenanceTemplate);
    this.saveData();

    activityTracker.trackActivity({
      userId: 'current_user',
      activityType: 'maintenance_template_created',
      entityType: 'maintenance_template',
      entityId: maintenanceTemplate.id,
      metadata: { templateName: maintenanceTemplate.name, category: maintenanceTemplate.category }
    });

    return maintenanceTemplate;
  }

  /**
   * Schedule maintenance based on template
   */
  scheduleFromTemplate(
    templateId: string,
    propertyId: string,
    options: {
      assetId?: string;
      customDate?: string;
      assignedTo?: string[];
      priority?: MaintenanceSchedule['priority'];
      notes?: string;
    } = {}
  ): MaintenanceSchedule {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const scheduledDate = options.customDate || this.calculateNextScheduleDate(template.frequency);
    const estimatedCompletionDate = this.calculateCompletionDate(scheduledDate, template.estimatedDuration);

    const schedule: MaintenanceSchedule = {
      id: `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId,
      propertyId,
      assetId: options.assetId,
      title: template.name,
      description: `${template.description}${options.notes ? ` - ${options.notes}` : ''}`,
      scheduledDate,
      estimatedCompletionDate,
      status: 'scheduled',
      priority: options.priority || template.priority,
      assignedTo: options.assignedTo,
      estimatedCost: template.estimatedCost,
      recurrence: {
        enabled: true,
        skipCount: 0
      },
      notifications: this.generateNotifications(scheduledDate, template.priority),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current_user'
    };

    this.schedules.set(schedule.id, schedule);
    this.updateAssetNextMaintenance(options.assetId, scheduledDate);
    this.saveData();

    activityTracker.trackActivity({
      userId: 'current_user',
      activityType: 'maintenance_scheduled',
      entityType: 'maintenance_schedule',
      entityId: schedule.id,
      metadata: { 
        templateName: template.name, 
        propertyId, 
        scheduledDate,
        priority: schedule.priority 
      }
    });

    return schedule;
  }

  /**
   * Complete a maintenance task
   */
  completeMaintenanceTask(
    scheduleId: string,
    completionData: Omit<MaintenanceCompletion, 'completionDate' | 'completedBy'>
  ): MaintenanceSchedule {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    const completion: MaintenanceCompletion = {
      completedBy: 'current_user',
      completionDate: new Date().toISOString(),
      ...completionData
    };

    schedule.status = 'completed';
    schedule.actualCompletionDate = completion.completionDate;
    schedule.actualCost = completion.costsBreakdown.reduce((sum, cost) => sum + cost.totalCost, 0);
    schedule.completionData = completion;
    schedule.updatedAt = new Date().toISOString();

    // Update recurrence if enabled
    if (schedule.recurrence.enabled) {
      this.scheduleNextRecurrence(schedule);
    }

    // Update asset maintenance history
    if (schedule.assetId) {
      this.updateAssetMaintenanceHistory(schedule.assetId, scheduleId);
    }

    this.saveData();

    activityTracker.trackActivity({
      userId: 'current_user',
      activityType: 'maintenance_completed',
      entityType: 'maintenance_schedule',
      entityId: scheduleId,
      metadata: { 
        actualCost: schedule.actualCost,
        timeSpent: completion.timeSpent,
        qualityRating: completion.qualityRating
      }
    });

    return schedule;
  }

  /**
   * Register an asset for maintenance tracking
   */
  registerAsset(asset: Omit<MaintenanceAsset, 'id' | 'createdAt' | 'updatedAt'>): MaintenanceAsset {
    const maintenanceAsset: MaintenanceAsset = {
      id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...asset
    };

    this.assets.set(maintenanceAsset.id, maintenanceAsset);
    this.saveData();

    // Schedule initial maintenance based on asset type
    this.scheduleInitialAssetMaintenance(maintenanceAsset);

    return maintenanceAsset;
  }

  /**
   * Generate maintenance calendar for a period
   */
  generateCalendar(startDate: string, endDate: string, propertyId?: string): MaintenanceCalendar[] {
    const calendar: MaintenanceCalendar[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0];
      
      const daySchedules = Array.from(this.schedules.values()).filter(schedule => {
        const scheduleDate = new Date(schedule.scheduledDate).toISOString().split('T')[0];
        const matchesDate = scheduleDate === dateStr;
        const matchesProperty = !propertyId || schedule.propertyId === propertyId;
        return matchesDate && matchesProperty && schedule.status !== 'cancelled';
      });

      const workload = this.calculateDayWorkload(daySchedules);
      const availability = this.calculateDayAvailability(daySchedules);

      calendar.push({
        date: dateStr,
        schedules: daySchedules,
        workload,
        availability
      });
    }

    return calendar;
  }

  /**
   * Generate maintenance report
   */
  generateReport(
    type: MaintenanceReport['type'],
    startDate: string,
    endDate: string,
    propertyId?: string
  ): MaintenanceReport {
    const period = { startDate, endDate };
    const relevantSchedules = this.getSchedulesInPeriod(startDate, endDate, propertyId);

    const metrics = this.calculateMetrics(relevantSchedules);
    const costAnalysis = this.calculateCostAnalysis(relevantSchedules);
    const recommendations = this.generateRecommendations(relevantSchedules, metrics);

    const report: MaintenanceReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      period,
      metrics,
      costAnalysis,
      recommendations,
      generatedAt: new Date().toISOString(),
      generatedBy: 'current_user'
    };

    return report;
  }

  /**
   * Get overdue maintenance tasks
   */
  getOverdueTasks(propertyId?: string): MaintenanceSchedule[] {
    const now = new Date();
    
    return Array.from(this.schedules.values())
      .filter(schedule => {
        const isOverdue = new Date(schedule.scheduledDate) < now && 
                         !['completed', 'cancelled'].includes(schedule.status);
        const matchesProperty = !propertyId || schedule.propertyId === propertyId;
        return isOverdue && matchesProperty;
      })
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }

  /**
   * Get upcoming maintenance tasks
   */
  getUpcomingTasks(days: number = 7, propertyId?: string): MaintenanceSchedule[] {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return Array.from(this.schedules.values())
      .filter(schedule => {
        const scheduleDate = new Date(schedule.scheduledDate);
        const isUpcoming = scheduleDate >= now && scheduleDate <= futureDate;
        const matchesProperty = !propertyId || schedule.propertyId === propertyId;
        const isActive = !['completed', 'cancelled'].includes(schedule.status);
        return isUpcoming && matchesProperty && isActive;
      })
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }

  /**
   * Get maintenance analytics
   */
  getAnalytics(propertyId?: string): {
    summary: {
      totalScheduled: number;
      totalCompleted: number;
      totalOverdue: number;
      completionRate: number;
      averageCost: number;
    };
    trends: Array<{
      month: string;
      scheduled: number;
      completed: number;
      cost: number;
    }>;
    categoryBreakdown: Record<string, number>;
    assetHealth: Array<{
      assetId: string;
      name: string;
      healthScore: number;
      nextMaintenance: string;
    }>;
  } {
    const relevantSchedules = Array.from(this.schedules.values())
      .filter(s => !propertyId || s.propertyId === propertyId);

    const summary = {
      totalScheduled: relevantSchedules.length,
      totalCompleted: relevantSchedules.filter(s => s.status === 'completed').length,
      totalOverdue: relevantSchedules.filter(s => 
        new Date(s.scheduledDate) < new Date() && !['completed', 'cancelled'].includes(s.status)
      ).length,
      completionRate: relevantSchedules.length > 0 ? 
        (relevantSchedules.filter(s => s.status === 'completed').length / relevantSchedules.length) * 100 : 0,
      averageCost: relevantSchedules.length > 0 ? 
        relevantSchedules.reduce((sum, s) => sum + (s.actualCost || s.estimatedCost), 0) / relevantSchedules.length : 0
    };

    const trends = this.calculateMaintenanceTrends(relevantSchedules);
    const categoryBreakdown = this.calculateCategoryBreakdown(relevantSchedules);
    const assetHealth = this.calculateAssetHealth();

    return {
      summary,
      trends,
      categoryBreakdown,
      assetHealth
    };
  }

  /**
   * Private helper methods
   */
  private calculateNextScheduleDate(frequency: MaintenanceFrequency): string {
    const now = new Date();
    
    switch (frequency.type) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        now.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
      case 'quarterly':
        now.setMonth(now.getMonth() + 3);
        break;
      case 'semi_annually':
        now.setMonth(now.getMonth() + 6);
        break;
      case 'annually':
        now.setFullYear(now.getFullYear() + 1);
        break;
      case 'custom':
        if (frequency.interval && frequency.intervalUnit) {
          switch (frequency.intervalUnit) {
            case 'days':
              now.setDate(now.getDate() + frequency.interval);
              break;
            case 'weeks':
              now.setDate(now.getDate() + frequency.interval * 7);
              break;
            case 'months':
              now.setMonth(now.getMonth() + frequency.interval);
              break;
            case 'years':
              now.setFullYear(now.getFullYear() + frequency.interval);
              break;
          }
        }
        break;
    }

    return now.toISOString();
  }

  private calculateCompletionDate(startDate: string, duration: number): string {
    const start = new Date(startDate);
    start.setMinutes(start.getMinutes() + duration);
    return start.toISOString();
  }

  private generateNotifications(scheduledDate: string, priority: string): MaintenanceNotification[] {
    const notifications: MaintenanceNotification[] = [];
    const scheduleDate = new Date(scheduledDate);

    // Due soon notification (based on priority)
    const daysBeforeMap = { low: 7, medium: 3, high: 1, critical: 1 };
    const daysBefore = daysBeforeMap[priority as keyof typeof daysBeforeMap] || 3;
    
    const dueSoonDate = new Date(scheduleDate);
    dueSoonDate.setDate(dueSoonDate.getDate() - daysBefore);

    notifications.push({
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'due_soon',
      recipientType: 'assignee',
      recipients: [],
      scheduledDate: dueSoonDate.toISOString(),
      method: 'email',
      message: `Maintenance task is due in ${daysBefore} day${daysBefore !== 1 ? 's' : ''}`,
      isActive: true
    });

    return notifications;
  }

  private scheduleNextRecurrence(schedule: MaintenanceSchedule): void {
    const template = this.templates.get(schedule.templateId);
    if (!template) return;

    const nextDate = this.calculateNextScheduleDate(template.frequency);
    schedule.recurrence.nextScheduledDate = nextDate;
    schedule.recurrence.lastCompletedDate = schedule.actualCompletionDate;

    // Create new schedule for next occurrence
    const nextSchedule: MaintenanceSchedule = {
      ...schedule,
      id: `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      scheduledDate: nextDate,
      estimatedCompletionDate: this.calculateCompletionDate(nextDate, template.estimatedDuration),
      status: 'scheduled',
      actualStartDate: undefined,
      actualCompletionDate: undefined,
      actualCost: undefined,
      completionData: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.schedules.set(nextSchedule.id, nextSchedule);
  }

  private updateAssetNextMaintenance(assetId: string | undefined, nextDate: string): void {
    if (!assetId) return;
    
    const asset = this.assets.get(assetId);
    if (asset) {
      asset.nextMaintenanceDate = nextDate;
      asset.updatedAt = new Date().toISOString();
    }
  }

  private updateAssetMaintenanceHistory(assetId: string, scheduleId: string): void {
    const asset = this.assets.get(assetId);
    if (asset) {
      asset.maintenanceHistory.push(scheduleId);
      asset.lastMaintenanceDate = new Date().toISOString();
      asset.updatedAt = new Date().toISOString();
    }
  }

  private scheduleInitialAssetMaintenance(asset: MaintenanceAsset): void {
    // Find applicable templates for this asset
    const applicableTemplates = Array.from(this.templates.values())
      .filter(template => this.isTemplateApplicableToAsset(template, asset));

    applicableTemplates.forEach(template => {
      this.scheduleFromTemplate(template.id, asset.propertyId, { assetId: asset.id });
    });
  }

  private isTemplateApplicableToAsset(template: MaintenanceTemplate, asset: MaintenanceAsset): boolean {
    // Simple logic - in real implementation, this would be more sophisticated
    return template.category === asset.category.toLowerCase();
  }

  private calculateDayWorkload(schedules: MaintenanceSchedule[]): MaintenanceCalendar['workload'] {
    return {
      totalTasks: schedules.length,
      estimatedHours: schedules.reduce((sum, s) => {
        const template = this.templates.get(s.templateId);
        return sum + (template ? template.estimatedDuration / 60 : 0);
      }, 0),
      estimatedCost: schedules.reduce((sum, s) => sum + s.estimatedCost, 0),
      criticalTasks: schedules.filter(s => s.priority === 'critical').length
    };
  }

  private calculateDayAvailability(schedules: MaintenanceSchedule[]): MaintenanceCalendar['availability'] {
    const totalSlots = 16; // 8 hours * 2 slots per hour
    const bookedSlots = schedules.length;
    
    return {
      availableSlots: Math.max(0, totalSlots - bookedSlots),
      bookedSlots,
      overbooked: bookedSlots > totalSlots
    };
  }

  private getSchedulesInPeriod(startDate: string, endDate: string, propertyId?: string): MaintenanceSchedule[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return Array.from(this.schedules.values()).filter(schedule => {
      const scheduleDate = new Date(schedule.scheduledDate);
      const inPeriod = scheduleDate >= start && scheduleDate <= end;
      const matchesProperty = !propertyId || schedule.propertyId === propertyId;
      return inPeriod && matchesProperty;
    });
  }

  private calculateMetrics(schedules: MaintenanceSchedule[]): MaintenanceReport['metrics'] {
    const completed = schedules.filter(s => s.status === 'completed');
    const overdue = schedules.filter(s => 
      new Date(s.scheduledDate) < new Date() && !['completed', 'cancelled'].includes(s.status)
    );

    return {
      totalScheduled: schedules.length,
      totalCompleted: completed.length,
      totalOverdue: overdue.length,
      completionRate: schedules.length > 0 ? (completed.length / schedules.length) * 100 : 0,
      averageCompletionTime: completed.length > 0 ? 
        completed.reduce((sum, s) => {
          if (s.completionData?.timeSpent) {
            return sum + s.completionData.timeSpent / 60; // convert to hours
          }
          return sum;
        }, 0) / completed.length : 0,
      totalCost: schedules.reduce((sum, s) => sum + (s.actualCost || s.estimatedCost), 0),
      costVariance: this.calculateCostVariance(schedules),
      assetUptime: this.calculateAssetUptime(),
      emergencyCallouts: this.calculateEmergencyCallouts(schedules),
      tenantSatisfaction: this.calculateTenantSatisfaction(completed)
    };
  }

  private calculateCostAnalysis(schedules: MaintenanceSchedule[]): MaintenanceReport['costAnalysis'] {
    const completed = schedules.filter(s => s.status === 'completed' && s.completionData);
    
    let laborCosts = 0;
    let materialCosts = 0;
    let equipmentCosts = 0;
    const categoryBreakdown: Record<string, number> = {};
    const vendorBreakdown: Record<string, number> = {};

    completed.forEach(schedule => {
      if (schedule.completionData?.costsBreakdown) {
        schedule.completionData.costsBreakdown.forEach(cost => {
          switch (cost.category) {
            case 'labor':
              laborCosts += cost.totalCost;
              break;
            case 'materials':
              materialCosts += cost.totalCost;
              break;
            case 'equipment':
              equipmentCosts += cost.totalCost;
              break;
          }

          const template = this.templates.get(schedule.templateId);
          if (template) {
            categoryBreakdown[template.category] = (categoryBreakdown[template.category] || 0) + cost.totalCost;
          }

          if (cost.vendor) {
            vendorBreakdown[cost.vendor] = (vendorBreakdown[cost.vendor] || 0) + cost.totalCost;
          }
        });
      }
    });

    const totalSpent = laborCosts + materialCosts + equipmentCosts;

    return {
      totalSpent,
      laborCosts,
      materialCosts,
      equipmentCosts,
      categoryBreakdown,
      vendorBreakdown
    };
  }

  private generateRecommendations(schedules: MaintenanceSchedule[], metrics: MaintenanceReport['metrics']): MaintenanceRecommendation[] {
    const recommendations: MaintenanceRecommendation[] = [];

    // Low completion rate recommendation
    if (metrics.completionRate < 80) {
      recommendations.push({
        type: 'process_improvement',
        priority: 'high',
        description: 'Completion rate is below 80%. Consider reviewing scheduling processes and resource allocation.',
        implementationEffort: 'medium',
        timeline: '30 days'
      });
    }

    // High cost variance recommendation
    if (metrics.costVariance > 20) {
      recommendations.push({
        type: 'cost_optimization',
        priority: 'medium',
        description: 'Actual costs exceed estimates by more than 20%. Review cost estimation processes.',
        expectedSavings: metrics.totalCost * 0.1,
        implementationEffort: 'low',
        timeline: '14 days'
      });
    }

    // High overdue tasks recommendation
    if (metrics.totalOverdue > metrics.totalScheduled * 0.15) {
      recommendations.push({
        type: 'schedule_adjustment',
        priority: 'high',
        description: 'High number of overdue tasks. Consider adjusting maintenance schedules or increasing resources.',
        implementationEffort: 'medium',
        timeline: '7 days'
      });
    }

    return recommendations;
  }

  private calculateCostVariance(schedules: MaintenanceSchedule[]): number {
    const completed = schedules.filter(s => s.status === 'completed' && s.actualCost);
    if (completed.length === 0) return 0;

    const totalEstimated = completed.reduce((sum, s) => sum + s.estimatedCost, 0);
    const totalActual = completed.reduce((sum, s) => sum + (s.actualCost || 0), 0);

    return totalEstimated > 0 ? ((totalActual - totalEstimated) / totalEstimated) * 100 : 0;
  }

  private calculateAssetUptime(): number {
    // Simplified calculation - in real implementation, this would track actual downtime
    return 95 + Math.random() * 4; // 95-99% uptime
  }

  private calculateEmergencyCallouts(schedules: MaintenanceSchedule[]): number {
    return schedules.filter(s => s.priority === 'critical').length;
  }

  private calculateTenantSatisfaction(completed: MaintenanceSchedule[]): number {
    const withSatisfaction = completed.filter(s => s.completionData?.customerSatisfaction);
    if (withSatisfaction.length === 0) return 0;

    return withSatisfaction.reduce((sum, s) => sum + (s.completionData?.customerSatisfaction || 0), 0) / withSatisfaction.length;
  }

  private calculateMaintenanceTrends(schedules: MaintenanceSchedule[]): Array<{
    month: string;
    scheduled: number;
    completed: number;
    cost: number;
  }> {
    const trends: Record<string, { scheduled: number; completed: number; cost: number }> = {};

    schedules.forEach(schedule => {
      const month = new Date(schedule.scheduledDate).toISOString().substring(0, 7); // YYYY-MM
      
      if (!trends[month]) {
        trends[month] = { scheduled: 0, completed: 0, cost: 0 };
      }

      trends[month].scheduled++;
      if (schedule.status === 'completed') {
        trends[month].completed++;
        trends[month].cost += schedule.actualCost || schedule.estimatedCost;
      }
    });

    return Object.entries(trends).map(([month, data]) => ({
      month,
      ...data
    })).sort((a, b) => a.month.localeCompare(b.month));
  }

  private calculateCategoryBreakdown(schedules: MaintenanceSchedule[]): Record<string, number> {
    const breakdown: Record<string, number> = {};

    schedules.forEach(schedule => {
      const template = this.templates.get(schedule.templateId);
      if (template) {
        breakdown[template.category] = (breakdown[template.category] || 0) + 1;
      }
    });

    return breakdown;
  }

  private calculateAssetHealth(): Array<{
    assetId: string;
    name: string;
    healthScore: number;
    nextMaintenance: string;
  }> {
    return Array.from(this.assets.values()).map(asset => ({
      assetId: asset.id,
      name: asset.name,
      healthScore: this.calculateSingleAssetHealth(asset),
      nextMaintenance: asset.nextMaintenanceDate || 'Not scheduled'
    }));
  }

  private calculateSingleAssetHealth(asset: MaintenanceAsset): number {
    // Simplified health calculation
    let score = 100;
    
    // Reduce score based on time since last maintenance
    if (asset.lastMaintenanceDate) {
      const daysSinceLastMaintenance = (Date.now() - new Date(asset.lastMaintenanceDate).getTime()) / (1000 * 60 * 60 * 24);
      score -= Math.min(30, daysSinceLastMaintenance * 0.5);
    }
    
    // Reduce score if maintenance is overdue
    if (asset.nextMaintenanceDate && new Date(asset.nextMaintenanceDate) < new Date()) {
      score -= 20;
    }
    
    return Math.max(0, score);
  }

  private initializeDefaultTemplates(): void {
    if (this.templates.size === 0) {
      const defaultTemplates: Omit<MaintenanceTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>[] = [
        {
          name: 'HVAC Filter Replacement',
          description: 'Replace HVAC air filters to maintain air quality and system efficiency',
          category: 'hvac',
          type: 'replacement',
          frequency: { type: 'quarterly', excludeWeekends: true },
          estimatedDuration: 30,
          estimatedCost: 25,
          priority: 'medium',
          isActive: true,
          checklist: [
            { id: '1', description: 'Remove old filter', type: 'replacement', isRequired: true },
            { id: '2', description: 'Check filter size and type', type: 'visual_inspection', isRequired: true },
            { id: '3', description: 'Install new filter', type: 'replacement', isRequired: true },
            { id: '4', description: 'Document filter brand and model', type: 'documentation', isRequired: true }
          ],
          requiredSkills: ['basic_maintenance'],
          requiredTools: ['basic_tools'],
          weatherDependency: false,
          safetyRequirements: [
            { id: '1', requirement: 'Turn off HVAC system before maintenance', type: 'procedure', isMandatory: true }
          ],
          complianceRequirements: [
            { id: '1', standard: 'Manufacturer Warranty', requirement: 'Regular filter replacement', expirationTracking: false }
          ]
        },
        {
          name: 'Smoke Detector Battery Check',
          description: 'Test smoke detectors and replace batteries as needed',
          category: 'safety',
          type: 'testing',
          frequency: { type: 'semi_annually' },
          estimatedDuration: 15,
          estimatedCost: 10,
          priority: 'high',
          isActive: true,
          checklist: [
            { id: '1', description: 'Test smoke detector alarm', type: 'test', isRequired: true },
            { id: '2', description: 'Check battery level', type: 'visual_inspection', isRequired: true },
            { id: '3', description: 'Replace battery if needed', type: 'replacement', isRequired: false },
            { id: '4', description: 'Document test results', type: 'documentation', isRequired: true }
          ],
          requiredSkills: ['basic_maintenance'],
          requiredTools: ['ladder', 'multimeter'],
          weatherDependency: false,
          safetyRequirements: [
            { id: '1', requirement: 'Use proper ladder safety', type: 'procedure', isMandatory: true }
          ],
          complianceRequirements: [
            { id: '1', standard: 'Local Fire Code', requirement: 'Bi-annual testing', frequency: 'semi_annually', expirationTracking: true }
          ]
        }
      ];

      defaultTemplates.forEach(template => {
        this.createTemplate(template);
      });
    }
  }

  private startSchedulingEngine(): void {
    // Check for new maintenance to schedule every hour
    this.schedulingInterval = setInterval(() => {
      this.processSchedulingQueue();
    }, 60 * 60 * 1000);
  }

  private startNotificationEngine(): void {
    // Check for notifications to send every 15 minutes
    this.notificationInterval = setInterval(() => {
      this.processNotificationQueue();
    }, 15 * 60 * 1000);
  }

  private processSchedulingQueue(): void {
    // Process recurring maintenance schedules
    const completedSchedules = Array.from(this.schedules.values())
      .filter(s => s.status === 'completed' && s.recurrence.enabled && !s.recurrence.nextScheduledDate);

    completedSchedules.forEach(schedule => {
      this.scheduleNextRecurrence(schedule);
    });
  }

  private processNotificationQueue(): void {
    const now = new Date();
    
    this.notifications.forEach(notification => {
      if (notification.isActive && 
          new Date(notification.scheduledDate) <= now && 
          !notification.sentDate) {
        
        this.sendNotification(notification);
        notification.sentDate = now.toISOString();
      }
    });

    this.saveData();
  }

  private sendNotification(notification: MaintenanceNotification): void {
    // In a real implementation, this would integrate with email/SMS services
    console.log(`Sending ${notification.method} notification: ${notification.message}`);
  }

  private loadData(): void {
    try {
      const templates = LocalStorageService.getItem('maintenance_templates');
      if (templates) {
        this.templates = new Map(Object.entries(templates));
      }

      const schedules = LocalStorageService.getItem('maintenance_schedules');
      if (schedules) {
        this.schedules = new Map(Object.entries(schedules));
      }

      const assets = LocalStorageService.getItem('maintenance_assets');
      if (assets) {
        this.assets = new Map(Object.entries(assets));
      }

      const notifications = LocalStorageService.getItem('maintenance_notifications');
      if (notifications && Array.isArray(notifications)) {
        this.notifications = notifications;
      }
    } catch (error) {
      console.error('Error loading maintenance data:', error);
    }
  }

  private saveData(): void {
    try {
      LocalStorageService.setItem('maintenance_templates', Object.fromEntries(this.templates));
      LocalStorageService.setItem('maintenance_schedules', Object.fromEntries(this.schedules));
      LocalStorageService.setItem('maintenance_assets', Object.fromEntries(this.assets));
      LocalStorageService.setItem('maintenance_notifications', this.notifications);
    } catch (error) {
      console.error('Error saving maintenance data:', error);
    }
  }

  /**
   * Cleanup when service is destroyed
   */
  destroy(): void {
    if (this.schedulingInterval) {
      clearInterval(this.schedulingInterval);
    }
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
    }
  }
}

export const preventiveMaintenanceService = new PreventiveMaintenanceService();
