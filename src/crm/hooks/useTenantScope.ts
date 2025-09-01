import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCrmData, Tenant } from '../contexts/CrmDataContext';

export interface TenantScope {
  isTenant: boolean;
  currentTenant: Tenant | null;
  tenantPropertyId: string | null;
  isAllowedProperty: (propertyId?: string | null) => boolean;
}

export function useTenantScope(): TenantScope {
  const { user } = useAuth();
  const { state } = useCrmData();

  const currentTenant = React.useMemo(() => {
    if (!user || user.role !== 'Tenant') return null;
    // Match by email or id
    const t = state.tenants.find(
      (x) => x.email === user.email || x.id === user.id
    );
    return t || null;
  }, [state.tenants, user]);

  const tenantPropertyId = currentTenant?.propertyId || null;

  const isAllowedProperty = React.useCallback(
    (propertyId?: string | null) => {
      if (!user || user.role !== 'Tenant') return true; // Non-tenants have full access per role-based controls
      if (!tenantPropertyId) return false;
      return !!propertyId && propertyId === tenantPropertyId;
    },
    [tenantPropertyId, user]
  );

  return {
    isTenant: !!user && user.role === 'Tenant',
    currentTenant,
    tenantPropertyId,
    isAllowedProperty,
  };
}
