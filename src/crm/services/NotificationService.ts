/**
 * Service for managing notifications and success messages across the CRM system
 */

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  autoHide?: boolean;
  autoHideDelay?: number;
  actions?: NotificationAction[];
  data?: any;
}

export interface NotificationAction {
  id: string;
  label: string;
  action: () => void;
  variant?: 'text' | 'outlined' | 'contained';
}

type NotificationListener = (notification: Notification) => void;

export class NotificationService {
  private static instance: NotificationService;
  private listeners: NotificationListener[] = [];
  private notifications: Notification[] = [];

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Subscribe to notification updates
   */
  public subscribe(listener: NotificationListener): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Show a notification
   */
  public show(notification: Omit<Notification, 'id' | 'timestamp'>): string {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      autoHide: notification.autoHide !== false, // Default to true
      autoHideDelay: notification.autoHideDelay || 6000,
    };

    this.notifications.push(fullNotification);
    
    // Notify all listeners
    this.listeners.forEach(listener => listener(fullNotification));

    // Auto-hide if enabled
    if (fullNotification.autoHide) {
      setTimeout(() => {
        this.hide(id);
      }, fullNotification.autoHideDelay);
    }

    return id;
  }

  /**
   * Hide a specific notification
   */
  public hide(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  /**
   * Clear all notifications
   */
  public clear(): void {
    this.notifications = [];
  }

  /**
   * Get all current notifications
   */
  public getAll(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Show success notification
   */
  public showSuccess(title: string, message: string, actions?: NotificationAction[]): string {
    return this.show({
      type: 'success',
      title,
      message,
      actions,
    });
  }

  /**
   * Show error notification
   */
  public showError(title: string, message: string, actions?: NotificationAction[]): string {
    return this.show({
      type: 'error',
      title,
      message,
      actions,
      autoHide: false, // Errors should not auto-hide
    });
  }

  /**
   * Show warning notification
   */
  public showWarning(title: string, message: string, actions?: NotificationAction[]): string {
    return this.show({
      type: 'warning',
      title,
      message,
      actions,
      autoHideDelay: 8000, // Warnings stay longer
    });
  }

  /**
   * Show info notification
   */
  public showInfo(title: string, message: string, actions?: NotificationAction[]): string {
    return this.show({
      type: 'info',
      title,
      message,
      actions,
    });
  }

  /**
   * Show application submission success
   */
  public showApplicationSuccess(applicantName: string, propertyName: string, propertyCode: string): string {
    return this.showSuccess(
      'Application Submitted Successfully!',
      `Application from ${applicantName} for ${propertyName} has been received. Reference: ${propertyCode}`,
      [
        {
          id: 'view_applications',
          label: 'View Applications',
          action: () => {
            window.location.href = '/crm/applications';
          },
          variant: 'outlined'
        }
      ]
    );
  }

  /**
   * Show payment success notification
   */
  public showPaymentSuccess(amount: number, method: string, confirmationCode: string): string {
    return this.showSuccess(
      'Payment Processed Successfully!',
      `$${amount.toFixed(2)} payment via ${method} has been processed. Confirmation: ${confirmationCode}`
    );
  }

  /**
   * Show property code generation notification
   */
  public showPropertyCodeGenerated(propertyName: string, propertyCode: string): string {
    return this.showInfo(
      'Property Code Generated',
      `New property code ${propertyCode} assigned to ${propertyName}`
    );
  }

  /**
   * Show template set as default notification
   */
  public showTemplateDefaultSet(templateName: string): string {
    return this.showSuccess(
      'Default Template Updated',
      `"${templateName}" has been set as the default rental application template.`
    );
  }

  /**
   * Show form validation errors
   */
  public showValidationErrors(errors: string[]): string {
    const errorList = errors.map(error => `• ${error}`).join('\n');
    return this.showError(
      'Form Validation Errors',
      `Please correct the following errors:\n${errorList}`
    );
  }

  /**
   * Show system initialization notification
   */
  public showSystemReady(): string {
    return this.showInfo(
      'System Ready',
      'Application system initialized successfully with payment integration and workflow automation.',
      [
        {
          id: 'view_demo',
          label: 'View Demo',
          action: () => {
            window.location.href = '/crm/application-demo';
          },
          variant: 'outlined'
        }
      ]
    );
  }
}

// Create global instance
export const notificationService = NotificationService.getInstance();

// Helper functions for quick access
export const showSuccess = (title: string, message: string, actions?: NotificationAction[]) => 
  notificationService.showSuccess(title, message, actions);

export const showError = (title: string, message: string, actions?: NotificationAction[]) => 
  notificationService.showError(title, message, actions);

export const showWarning = (title: string, message: string, actions?: NotificationAction[]) => 
  notificationService.showWarning(title, message, actions);

export const showInfo = (title: string, message: string, actions?: NotificationAction[]) => 
  notificationService.showInfo(title, message, actions);
