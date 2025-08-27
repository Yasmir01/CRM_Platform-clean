import React, { createContext, useContext, useState, useEffect } from 'react';
import { DatabaseUserService, DatabaseUser, LoginCredentials, LoginResult } from '../services/DatabaseUserService';
import { TokenService } from '../services/TokenService';

export interface ProductionAuthContextType {
  user: DatabaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateProfile: (updates: Partial<DatabaseUser>) => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
}

const ProductionAuthContext = createContext<ProductionAuthContextType | undefined>(undefined);

// Role-based permissions (same as original)
const rolePermissions: Record<string, string[]> = {
  'Super Admin': [
    'all', 'manage_users', 'manage_company', 'manage_templates', 
    'system_settings', 'view_analytics', 'manage_properties',
    'manage_tenants', 'manage_leases', 'view_reports', 'send_communications',
    'manage_maintenance', 'manage_finances', 'manage_documents',
    'delete_charges', 'add_credits', 'view_financial_ledger',
    'manage_all_users', 'assign_all_roles', 'view_system_analytics',
    'manage_integrations', 'manage_backups'
  ],
  'Admin': [
    'manage_templates', 'manage_company', 'view_analytics',
    'manage_properties', 'manage_tenants', 'manage_leases',
    'view_reports', 'send_communications', 'manage_maintenance',
    'manage_finances', 'manage_documents', 'delete_charges',
    'add_credits', 'view_financial_ledger', 'manage_lower_users',
    'assign_manager_roles', 'view_company_analytics'
  ],
  'Manager': [
    'manage_properties', 'manage_tenants', 'manage_leases',
    'view_reports', 'send_communications', 'manage_maintenance',
    'manage_finances', 'manage_documents', 'add_credits',
    'view_financial_ledger', 'manage_staff', 'assign_property_manager_roles'
  ],
  'Property Manager': [
    'manage_properties', 'manage_tenants', 'manage_leases',
    'view_reports', 'send_communications', 'manage_maintenance',
    'manage_finances', 'manage_documents', 'add_credits',
    'view_financial_ledger'
  ],
  'User': [
    'view_properties', 'view_tenants', 'view_reports',
    'send_communications', 'view_maintenance', 'view_documents'
  ],
  'Tenant': [
    'view_profile', 'view_lease', 'pay_rent',
    'submit_maintenance', 'view_communications'
  ],
  'Service Provider': [
    'view_work_orders', 'update_work_status',
    'submit_invoices', 'view_communications'
  ]
};

export function ProductionAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DatabaseUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const refreshTokenValue = localStorage.getItem('refreshToken');

      if (!accessToken || !refreshTokenValue) {
        setIsLoading(false);
        return;
      }

      // Check if access token is valid
      const payload = TokenService.verifyAccessToken(accessToken);
      if (payload) {
        // Access token is valid, get user data
        const userData = await DatabaseUserService.getUserById(payload.userId);
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      } else {
        // Access token expired, try refresh
        const refreshResult = await refreshToken();
        if (!refreshResult) {
          // Refresh failed, clear tokens
          await logout();
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
    try {
      setIsLoading(true);
      
      // Add device info for session tracking
      const enhancedCredentials = {
        ...credentials,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language
        },
        ipAddress: await getClientIP() // You'd implement this
      };

      const result = await DatabaseUserService.authenticateUser(enhancedCredentials);
      
      if (result.success && result.user && result.accessToken && result.refreshToken) {
        // Store tokens securely
        localStorage.setItem('accessToken', result.accessToken);
        localStorage.setItem('refreshToken', result.refreshToken);
        
        // Set auth state
        setUser(result.user);
        setIsAuthenticated(true);
        
        // Log successful login
        await logSecurityEvent('login_success', {
          userId: result.user.id,
          email: result.user.email,
          timestamp: new Date().toISOString()
        });
      } else {
        // Log failed login attempt
        await logSecurityEvent('login_failure', {
          email: credentials.email,
          reason: result.message,
          timestamp: new Date().toISOString()
        });
      }

      return result;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed due to system error'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (user && accessToken) {
        // Invalidate session on server
        await invalidateSession(accessToken);
        
        // Log logout
        await logSecurityEvent('logout', {
          userId: user.id,
          email: user.email,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken');
      if (!refreshTokenValue) {
        return false;
      }

      const payload = TokenService.verifyRefreshToken(refreshTokenValue);
      if (!payload) {
        return false;
      }

      // Get user data
      const userData = await DatabaseUserService.getUserById(payload.userId);
      if (!userData) {
        return false;
      }

      // Generate new access token
      const { token: newAccessToken } = TokenService.generateAccessToken({
        userId: userData.id,
        email: userData.email,
        role: userData.role
      });

      // Store new access token
      localStorage.setItem('accessToken', newAccessToken);
      
      // Update auth state
      setUser(userData);
      setIsAuthenticated(true);
      
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };

  const updateProfile = async (updates: Partial<DatabaseUser>): Promise<boolean> => {
    if (!user) return false;

    try {
      const success = await DatabaseUserService.updateUser(user.id, updates);
      if (success) {
        setUser(prev => prev ? { ...prev, ...updates } : null);
        
        // Log profile update
        await logSecurityEvent('profile_update', {
          userId: user.id,
          updatedFields: Object.keys(updates),
          timestamp: new Date().toISOString()
        });
      }
      return success;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user || !isAuthenticated) return false;
    
    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes('all') || userPermissions.includes(permission);
  };

  // Helper functions
  const getClientIP = async (): Promise<string> => {
    try {
      // In production, you'd use a service to get real IP
      return 'unknown';
    } catch {
      return 'unknown';
    }
  };

  const invalidateSession = async (accessToken: string): Promise<void> => {
    try {
      // In production, call API to invalidate session
      console.log('Session invalidated');
    } catch (error) {
      console.error('Error invalidating session:', error);
    }
  };

  const logSecurityEvent = async (action: string, details: any): Promise<void> => {
    try {
      // In production, log to audit table via API
      console.log('Security event:', action, details);
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };

  const contextValue: ProductionAuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
    updateProfile,
    hasPermission
  };

  return (
    <ProductionAuthContext.Provider value={contextValue}>
      {children}
    </ProductionAuthContext.Provider>
  );
}

export function useProductionAuth(): ProductionAuthContextType {
  const context = useContext(ProductionAuthContext);
  if (context === undefined) {
    throw new Error('useProductionAuth must be used within a ProductionAuthProvider');
  }
  return context;
}
