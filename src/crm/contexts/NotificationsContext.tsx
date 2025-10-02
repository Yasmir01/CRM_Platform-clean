import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useCrmData, CrmDataContext } from './CrmDataContext';
import { suggestionService } from '../services/SuggestionService';
import { useTenantScope } from '../hooks/useTenantScope';

export interface Notification {
  id: string;
  type: 'promotion' | 'task' | 'email' | 'payment' | 'maintenance' | 'lease' | 'reminder' | 'warning' | 'suggestion' | 'suggestion_vote' | 'suggestion_status';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  createdAt: Date;
  dueDate?: Date;
  actionUrl?: string;
  actionLabel?: string;
  relatedEntity?: {
    type: 'property' | 'tenant' | 'promotion' | 'application' | 'suggestion';
    id: string;
    name: string;
  };
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  getNotificationsByType: (type: Notification['type']) => Notification[];
  getUrgentNotifications: () => Notification[];
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

interface NotificationsProviderProps {
  children: ReactNode;
}

const generateRealNotifications = (crmData: any): Notification[] => {
  const notifications: Notification[] = [];
  const { properties = [], tenants = [], workOrders = [] } = crmData || {};
  const now = new Date();

  // Only show the real 590 Hawkins Store Rd rental notification
  const hawkinsProperty = properties.find((p: any) => p.address?.includes("590") && p.address?.includes("Hawkins"));
  if (hawkinsProperty) {
    const hawkinsTenant = tenants.find((t: any) => t.propertyId === hawkinsProperty.id && t.status === "Active");
    if (hawkinsTenant) {
      notifications.push({
        id: 'hawkins-rental',
        type: 'email',
        title: 'Recent Rental Success',
        message: `New lease signed for 590 Hawkins Store Rd by ${hawkinsTenant.firstName} ${hawkinsTenant.lastName}`,
        priority: 'medium',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        actionUrl: `/crm/tenants?tenant=${encodeURIComponent(hawkinsTenant.firstName + ' ' + hawkinsTenant.lastName)}`,
        actionLabel: 'View Tenant',
        relatedEntity: {
          type: 'tenant',
          id: hawkinsTenant.id,
          name: `${hawkinsTenant.firstName} ${hawkinsTenant.lastName}`
        }
      });
    }
  }

  // Add task notifications from work orders
  workOrders.forEach((workOrder: any) => {
    const createdDate = new Date(workOrder.createdAt || workOrder.dateCreated || now);
    const hoursSinceCreated = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

    // Show notifications for new work orders created in the last 24 hours
    if (hoursSinceCreated <= 24 && (workOrder.status === 'Open' || workOrder.status === 'In Progress')) {
      const property = properties.find((p: any) => p.id === workOrder.propertyId);

      notifications.push({
        id: `task-wo-${workOrder.id}`,
        type: 'task',
        title: 'New Task Created',
        message: `Work order "${workOrder.title}" needs attention${property ? ` at ${property.name || property.address}` : ''}`,
        priority: workOrder.priority === 'High' ? 'high' : workOrder.priority === 'Medium' ? 'medium' : 'low',
        read: false,
        createdAt: createdDate,
        actionUrl: '/crm/tasks',
        actionLabel: 'View Task',
        relatedEntity: {
          type: 'workOrder',
          id: workOrder.id,
          name: workOrder.title
        }
      });
    }
  });

  // Add lease renewal task notifications
  tenants.forEach((tenant: any) => {
    if (tenant.leaseEndDate && tenant.status === 'Active') {
      const leaseEnd = new Date(tenant.leaseEndDate);
      const daysUntilExpiry = Math.ceil((leaseEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Show notification for leases expiring in 30 days or less
      if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
        const property = properties.find((p: any) => p.id === tenant.propertyId);

        notifications.push({
          id: `task-lease-${tenant.id}`,
          type: 'reminder',
          title: 'Lease Renewal Required',
          message: `Lease for ${tenant.firstName} ${tenant.lastName} expires in ${daysUntilExpiry} days${property ? ` at ${property.name || property.address}` : ''}`,
          priority: daysUntilExpiry <= 7 ? 'high' : daysUntilExpiry <= 14 ? 'medium' : 'low',
          read: false,
          createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
          actionUrl: '/crm/tasks',
          actionLabel: 'Schedule Renewal',
          relatedEntity: {
            type: 'tenant',
            id: tenant.id,
            name: `${tenant.firstName} ${tenant.lastName}`
          }
        });
      }
    }
  });

  // Add suggestion notifications
  try {
    const suggestionNotifications = suggestionService.getNotifications();
    suggestionNotifications.forEach(suggestionNotif => {
      // Only show notifications from the last 7 days
      const daysSinceCreated = (now.getTime() - suggestionNotif.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated <= 7) {
        let notificationType: Notification['type'] = 'suggestion';
        let priority: Notification['priority'] = 'medium';

        // Map suggestion notification types to main notification types
        switch (suggestionNotif.type) {
          case 'new_suggestion':
            notificationType = 'suggestion';
            priority = 'medium';
            break;
          case 'new_vote':
            notificationType = 'suggestion_vote';
            priority = 'low';
            break;
          case 'status_change':
            notificationType = 'suggestion_status';
            priority = 'medium';
            break;
        }

        notifications.push({
          id: `suggestion-${suggestionNotif.id}`,
          type: notificationType,
          title: suggestionNotif.message.split(' - ')[0] || suggestionNotif.suggestionTitle,
          message: suggestionNotif.message,
          priority,
          read: suggestionNotif.read,
          createdAt: suggestionNotif.createdAt,
          actionUrl: `/crm/suggestions`,
          actionLabel: 'View Suggestion',
          relatedEntity: {
            type: 'suggestion',
            id: suggestionNotif.suggestionId,
            name: suggestionNotif.suggestionTitle
          }
        });
      }
    });
  } catch (error) {
    console.error('Error loading suggestion notifications:', error);
  }

  // Add a demo task notification to show the new features
  if (workOrders.length > 0 || tenants.length > 0) {
    notifications.push({
      id: 'demo-task-notification',
      type: 'task',
      title: 'New Maintenance Task',
      message: 'HVAC inspection required for Sunset Apartments - Schedule maintenance visit',
      priority: 'medium',
      read: false,
      createdAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
      actionUrl: '/crm/tasks',
      actionLabel: 'View Task',
      relatedEntity: {
        type: 'workOrder',
        id: 'demo-task-1',
        name: 'HVAC Inspection'
      }
    });
  }

  return notifications;
};

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  // Safely get CRM data - it might not be available during initial render
  const crmContext = useContext(CrmDataContext);
  const state = crmContext?.state;
  const { isTenant, tenantPropertyId } = useTenantScope();
  const [manualNotifications, setManualNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Record<string, boolean>>({});
  const [removedIds, setRemovedIds] = useState<Record<string, boolean>>({});

  const notifications = useMemo(() => {
    if (!state?.initialized) {
      // Apply overrides to manual notifications
      return manualNotifications
        .filter(n => !removedIds[n.id])
        .map(n => ({ ...n, read: readIds[n.id] !== undefined ? readIds[n.id] : n.read }));
    }

    const realNotifications = generateRealNotifications(state);

    // Apply overrides to both real and manual notifications
    let realWithOverrides = realNotifications
      .filter(n => !removedIds[n.id])
      .map(n => ({ ...n, read: readIds[n.id] !== undefined ? readIds[n.id] : n.read }));

    // Tenant scoping: only notifications related to their property or generic suggestion/admin notices
    if (isTenant && tenantPropertyId && state) {
      realWithOverrides = realWithOverrides.filter(n => {
        // Allow suggestion notifications (no sensitive data)
        if (n.type === 'suggestion' || n.type === 'suggestion_vote' || n.type === 'suggestion_status') return true;
        // If related to a tenant, verify tenant's property
        if (n.relatedEntity?.type === 'tenant') {
          const t = state.tenants.find(tt => tt.id === n.relatedEntity?.id);
          return t?.propertyId === tenantPropertyId;
        }
        // If related to a work order, verify work order property
        if (n.relatedEntity?.type === 'workOrder') {
          const wo = state.workOrders.find(w => w.id === n.relatedEntity?.id);
          return wo?.propertyId === tenantPropertyId;
        }
        // If related to a property, check id match
        if (n.relatedEntity?.type === 'property') {
          return n.relatedEntity.id === tenantPropertyId;
        }
        // Default: hide
        return false;
      });
    }

    const manualWithOverrides = manualNotifications
      .filter(n => !removedIds[n.id])
      .map(n => ({ ...n, read: readIds[n.id] !== undefined ? readIds[n.id] : n.read }));

    return [...realWithOverrides, ...manualWithOverrides];
  }, [state, manualNotifications, readIds, removedIds]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date()
    };
    setManualNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    // Handle suggestion notifications
    if (id.startsWith('suggestion-')) {
      const suggestionNotificationId = id.replace('suggestion-', '');
      suggestionService.markNotificationAsRead(suggestionNotificationId);
    }

    // Mark as read in override state (works for both generated and manual notifications)
    setReadIds(prev => ({ ...prev, [id]: true }));

    // Also update manual notifications for consistency
    setManualNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    // Mark all suggestion notifications as read
    try {
      const suggestionNotifications = suggestionService.getNotifications();
      suggestionNotifications.forEach(notif => {
        if (!notif.read) {
          suggestionService.markNotificationAsRead(notif.id);
        }
      });
    } catch (error) {
      console.error('Error marking suggestion notifications as read:', error);
    }

    // Mark all current notifications as read in override state
    setReadIds(prev => {
      const newReadIds = { ...prev };
      notifications.forEach(notification => {
        newReadIds[notification.id] = true;
      });
      return newReadIds;
    });

    // Also update manual notifications for consistency
    setManualNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    // Add to removed IDs override (works for both generated and manual notifications)
    setRemovedIds(prev => ({ ...prev, [id]: true }));

    // Also remove from manual notifications
    setManualNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setManualNotifications([]);
    setReadIds({});
    setRemovedIds({});
  };

  const getNotificationsByType = (type: Notification['type']) => {
    return notifications.filter(notification => notification.type === type);
  };

  const getUrgentNotifications = () => {
    return notifications.filter(notification => 
      notification.priority === 'urgent' || notification.priority === 'high'
    );
  };

  // Auto-refresh notifications when CRM data changes
  useEffect(() => {
    // Notifications will automatically update when state changes through useMemo
  }, [state]);

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    getNotificationsByType,
    getUrgentNotifications
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsContext;
