import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

type UserMode = 'management' | 'tenant';

interface ModeContextType {
  currentMode: UserMode;
  setCurrentMode: (mode: UserMode) => void;
  isTenantMode: boolean;
  isManagementMode: boolean;
  toggleMode: () => void;
  canSwitchToTenantMode: boolean;
  canSwitchToManagementMode: boolean;
  effectiveUserRole: string;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

interface ModeProviderProps {
  children: ReactNode;
}

export function ModeProvider({ children }: ModeProviderProps) {
  const { user, hasPermission } = useAuth();
  const [currentMode, setCurrentMode] = useState<UserMode>(() => {
    // Load mode from localStorage or default based on user role
    const savedMode = localStorage.getItem('userMode');
    if (savedMode === 'tenant' || savedMode === 'management') {
      return savedMode;
    }
    // Default mode based on user role
    return user?.role === 'Tenant' ? 'tenant' : 'management';
  });

  // Update mode when user changes
  useEffect(() => {
    if (user) {
      // If user is a tenant, force tenant mode
      if (user.role === 'Tenant') {
        setCurrentMode('tenant');
      }
      // If user was in tenant mode but is not a tenant, switch to management
      else if (currentMode === 'tenant' && user.role !== 'Tenant') {
        setCurrentMode('management');
      }
    }
  }, [user, currentMode]);

  // Save mode to localStorage
  useEffect(() => {
    localStorage.setItem('userMode', currentMode);
  }, [currentMode]);

  const isTenantMode = currentMode === 'tenant';
  const isManagementMode = currentMode === 'management';

  // Access control logic
  const canSwitchToTenantMode = user?.role === 'Admin' || user?.role === 'Property Manager' || user?.role === 'Tenant';
  const canSwitchToManagementMode = user?.role === 'Admin' || user?.role === 'Property Manager';

  // Determine effective user role for UI purposes
  const effectiveUserRole = isTenantMode ? 'Tenant' : (user?.role || 'Admin');

  const toggleMode = () => {
    if (currentMode === 'management' && canSwitchToTenantMode) {
      setCurrentMode('tenant');
    } else if (currentMode === 'tenant' && canSwitchToManagementMode) {
      setCurrentMode('management');
    }
  };

  const setModeWithPermissionCheck = (mode: UserMode) => {
    if (mode === 'tenant' && canSwitchToTenantMode) {
      setCurrentMode('tenant');
    } else if (mode === 'management' && canSwitchToManagementMode) {
      setCurrentMode('management');
    }
  };

  const value: ModeContextType = {
    currentMode,
    setCurrentMode: setModeWithPermissionCheck,
    isTenantMode,
    isManagementMode,
    toggleMode,
    canSwitchToTenantMode,
    canSwitchToManagementMode,
    effectiveUserRole,
  };

  return (
    <ModeContext.Provider value={value}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}

export default ModeContext;
