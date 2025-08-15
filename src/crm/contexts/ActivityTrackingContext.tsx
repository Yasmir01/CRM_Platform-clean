import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import activityTracker, { ActivityEvent, ActivityFilter } from '../services/ActivityTrackingService';

interface ActivityTrackingContextType {
  activities: ActivityEvent[];
  trackPropertyActivity: (action: ActivityEvent['action'], propertyId: string, propertyName: string, changes: ActivityEvent['changes'], description: string, metadata?: ActivityEvent['metadata']) => ActivityEvent;
  trackTenantActivity: (action: ActivityEvent['action'], tenantId: string, tenantName: string, changes: ActivityEvent['changes'], description: string, metadata?: ActivityEvent['metadata']) => ActivityEvent;
  trackDepositTransfer: (fromPropertyId: string, fromPropertyName: string, toPropertyId: string, toPropertyName: string, tenantId: string, tenantName: string, amount: number) => void;
  trackPaymentActivity: (paymentId: string, tenantId: string, tenantName: string, propertyId: string, propertyName: string, amount: number, type: string, status: string) => ActivityEvent;
  getEntityActivities: (entityType: string, entityId: string) => ActivityEvent[];
  getActivities: (filter?: ActivityFilter) => ActivityEvent[];
  generateAuditReport: (filter?: ActivityFilter) => any;
  refreshActivities: () => void;
}

const ActivityTrackingContext = createContext<ActivityTrackingContextType | undefined>(undefined);

export const useActivityTracking = () => {
  const context = useContext(ActivityTrackingContext);
  if (!context) {
    throw new Error('useActivityTracking must be used within an ActivityTrackingProvider');
  }
  return context;
};

interface ActivityTrackingProviderProps {
  children: ReactNode;
}

export const ActivityTrackingProvider: React.FC<ActivityTrackingProviderProps> = ({ children }) => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);

  // Load initial activities
  useEffect(() => {
    setActivities(activityTracker.getActivities());
  }, []);

  // Subscribe to new activities
  useEffect(() => {
    const unsubscribe = activityTracker.subscribe((newActivity: ActivityEvent) => {
      setActivities(current => [newActivity, ...current]);
    });

    return unsubscribe;
  }, []);

  const refreshActivities = () => {
    setActivities(activityTracker.getActivities());
  };

  const value: ActivityTrackingContextType = {
    activities,
    trackPropertyActivity: activityTracker.trackPropertyActivity.bind(activityTracker),
    trackTenantActivity: activityTracker.trackTenantActivity.bind(activityTracker),
    trackDepositTransfer: activityTracker.trackDepositTransfer.bind(activityTracker),
    trackPaymentActivity: activityTracker.trackPaymentActivity.bind(activityTracker),
    getEntityActivities: activityTracker.getEntityActivities.bind(activityTracker),
    getActivities: activityTracker.getActivities.bind(activityTracker),
    generateAuditReport: activityTracker.generateAuditReport.bind(activityTracker),
    refreshActivities,
  };

  return (
    <ActivityTrackingContext.Provider value={value}>
      {children}
    </ActivityTrackingContext.Provider>
  );
};

export default ActivityTrackingContext;
