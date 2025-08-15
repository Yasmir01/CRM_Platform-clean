import { useContext } from 'react';
import { useActivityTracking as useActivityTrackingContext } from '../contexts/ActivityTrackingContext';

/**
 * Convenient hook for common activity tracking scenarios
 */
export const useActivityTracking = () => {
  const context = useActivityTrackingContext();

  const trackTenantMove = (
    tenantId: string,
    tenantName: string,
    fromPropertyId: string,
    fromPropertyName: string,
    toPropertyId: string,
    toPropertyName: string,
    depositAmount?: number
  ) => {
    // Track the tenant move
    context.trackTenantActivity(
      'move',
      tenantId,
      tenantName,
      [
        {
          field: 'property',
          oldValue: fromPropertyName,
          newValue: toPropertyName,
          displayName: 'Property Assignment'
        }
      ],
      `Tenant ${tenantName} moved from ${fromPropertyName} to ${toPropertyName}`,
      {
        relatedEntityType: 'property',
        relatedEntityId: toPropertyId,
        relatedEntityName: toPropertyName,
        notes: depositAmount ? `Security deposit: $${depositAmount.toLocaleString()}` : undefined
      }
    );

    // If there's a deposit transfer, track it
    if (depositAmount && depositAmount > 0) {
      context.trackDepositTransfer(
        fromPropertyId,
        fromPropertyName,
        toPropertyId,
        toPropertyName,
        tenantId,
        tenantName,
        depositAmount
      );
    }
  };

  const trackPropertyStatusChange = (
    propertyId: string,
    propertyName: string,
    oldStatus: string,
    newStatus: string,
    tenantId?: string,
    tenantName?: string
  ) => {
    context.trackPropertyActivity(
      'status_change',
      propertyId,
      propertyName,
      [
        {
          field: 'status',
          oldValue: oldStatus,
          newValue: newStatus,
          displayName: 'Property Status'
        }
      ],
      `Property status changed from ${oldStatus} to ${newStatus}`,
      tenantId ? {
        relatedEntityType: 'tenant',
        relatedEntityId: tenantId,
        relatedEntityName: tenantName,
      } : undefined
    );
  };

  const trackRentPayment = (
    paymentId: string,
    tenantId: string,
    tenantName: string,
    propertyId: string,
    propertyName: string,
    amount: number,
    method: string = 'Online',
    status: string = 'completed'
  ) => {
    return context.trackPaymentActivity(
      paymentId,
      tenantId,
      tenantName,
      propertyId,
      propertyName,
      amount,
      'Rent',
      status
    );
  };

  const trackMaintenanceRequest = (
    workOrderId: string,
    propertyId: string,
    propertyName: string,
    tenantId: string,
    tenantName: string,
    description: string,
    priority: string
  ) => {
    context.trackPropertyActivity(
      'maintenance',
      propertyId,
      propertyName,
      [
        {
          field: 'maintenance_request',
          oldValue: null,
          newValue: description,
          displayName: 'Maintenance Request'
        }
      ],
      `Maintenance request created: ${description}`,
      {
        relatedEntityType: 'tenant',
        relatedEntityId: tenantId,
        relatedEntityName: tenantName,
        notes: `Priority: ${priority}, Work Order: ${workOrderId}`
      }
    );
  };

  const trackLeaseUpdate = (
    leaseId: string,
    leaseName: string,
    tenantId: string,
    tenantName: string,
    propertyId: string,
    propertyName: string,
    changes: Array<{field: string; oldValue: any; newValue: any; displayName: string}>
  ) => {
    context.trackLeaseActivity(
      'update',
      leaseId,
      leaseName,
      changes,
      `Lease updated for ${tenantName} at ${propertyName}`,
      {
        relatedEntityType: 'tenant',
        relatedEntityId: tenantId,
        relatedEntityName: tenantName,
        notes: `Property: ${propertyName} (${propertyId})`
      }
    );
  };

  const trackDocumentUpload = (
    documentId: string,
    documentName: string,
    entityType: 'tenant' | 'property' | 'lease',
    entityId: string,
    entityName: string
  ) => {
    context.trackTenantActivity(
      'create',
      entityId,
      entityName,
      [
        {
          field: 'document',
          oldValue: null,
          newValue: documentName,
          displayName: 'Document Added'
        }
      ],
      `Document uploaded: ${documentName}`,
      {
        notes: `Document ID: ${documentId}, Type: ${entityType}`
      }
    );
  };

  return {
    ...context,
    trackTenantMove,
    trackPropertyStatusChange,
    trackRentPayment,
    trackMaintenanceRequest,
    trackLeaseUpdate,
    trackDocumentUpload,
  };
};

export default useActivityTracking;
