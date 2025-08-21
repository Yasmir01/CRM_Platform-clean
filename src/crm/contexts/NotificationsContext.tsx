import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useCrmData, CrmDataContext } from './CrmDataContext';

export interface Notification {
  id: string;
  type: 'promotion' | 'task' | 'email' | 'payment' | 'maintenance' | 'lease' | 'reminder' | 'warning';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  createdAt: Date;
  dueDate?: Date;
  actionUrl?: string;
  actionLabel?: string;
  relatedEntity?: {
    type: 'property' | 'tenant' | 'promotion' | 'application';
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
        actionUrl: `/crm/properties/${hawkinsProperty.id}`,
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

  return notifications;
};

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  // Safely get CRM data - it might not be available during initial render
  const crmContext = useContext(CrmDataContext);
  const state = crmContext?.state;
  const [manualNotifications, setManualNotifications] = useState<Notification[]>([]);

  const notifications = useMemo(() => {
    if (!state?.initialized) return manualNotifications;
    const realNotifications = generateRealNotifications(state);
    return [...realNotifications, ...manualNotifications];
  }, [state, manualNotifications]);

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
    setManualNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setManualNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setManualNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setManualNotifications([]);
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
