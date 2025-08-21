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
  const { properties = [], tenants = [] } = crmData || {};

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

  return notifications; // Return only the real notification
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
