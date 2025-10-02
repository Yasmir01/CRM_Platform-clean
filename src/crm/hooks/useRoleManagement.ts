import { useAuth } from '../contexts/AuthContext';

export const useRoleManagement = () => {
  const { user, hasPermission } = useAuth();

  // Role checkers with hierarchy
  const isSuperAdmin = () => user?.role === 'Super Admin';
  const isAdmin = () => user?.role === 'Admin' || isSuperAdmin();
  const isManager = () => user?.role === 'Manager' || isAdmin();
  const isPropertyManager = () => user?.role === 'Property Manager' || isManager();
  const isUser = () => user?.role === 'User' || isPropertyManager();
  const isTenant = () => user?.role === 'Tenant';
  const isServiceProvider = () => user?.role === 'Service Provider';

  // Get role hierarchy level (higher number = more authority)
  const getRoleLevel = (role?: string) => {
    const roleToCheck = role || user?.role;
    switch (roleToCheck) {
      case 'Super Admin': return 10;
      case 'Admin': return 8;
      case 'Manager': return 6;
      case 'Property Manager': return 4;
      case 'User': return 2;
      case 'Tenant': return 1;
      case 'Service Provider': return 1;
      default: return 0;
    }
  };

  // Check if current user has higher authority than target role
  const hasHigherAuthorityThan = (targetRole: string) => {
    return getRoleLevel() > getRoleLevel(targetRole);
  };

  // Permission checkers
  const canManageUsers = () => hasPermission('manage_users') || isSuperAdmin();
  const canManageCompany = () => hasPermission('manage_company') || isAdmin();
  const canManageTemplates = () => hasPermission('manage_templates') || isAdmin();
  const canViewAnalytics = () => hasPermission('view_analytics') || isAdmin();
  const canManageProperties = () => hasPermission('manage_properties') || isAdmin();
  const canAccessSystemSettings = () => hasPermission('system_settings') || isSuperAdmin();

  // Template and form access
  const canCreateTemplates = () => canManageTemplates();
  const canEditTemplates = () => canManageTemplates();
  const canDeleteTemplates = () => canManageTemplates();
  const canAccessTemplateLibrary = () => isSuperAdmin() || isAdmin() || isPropertyManager();

  // Company settings access
  const canEditCompanySettings = () => canManageCompany();
  const canViewCompanySettings = () => isSuperAdmin() || isAdmin() || isPropertyManager();

  // Power tools access
  const canAccessPowerTools = () => isSuperAdmin() || isAdmin() || isPropertyManager();
  const canCreateQRCodes = () => canAccessPowerTools();
  const canManageContests = () => canAccessPowerTools();

  // User management access
  const canCreateUsers = () => canManageUsers();
  const canEditUsers = () => canManageUsers();
  const canDeleteUsers = () => canManageUsers();
  const canViewAllUsers = () => canManageUsers();

  // Role assignment based on hierarchy (can only assign roles with lower or equal authority)
  const canAssignRole = (targetRole: string) => {
    if (!canManageUsers()) return false;

    // Super Admin can assign any role
    if (isSuperAdmin()) return true;

    // Admin can assign Manager and below, but not Super Admin or Admin
    if (isAdmin() && user?.role === 'Admin') {
      return !['Super Admin', 'Admin'].includes(targetRole);
    }

    // Manager can assign Property Manager and below
    if (isManager() && user?.role === 'Manager') {
      return !['Super Admin', 'Admin', 'Manager'].includes(targetRole);
    }

    // Property Manager can assign User, Tenant, Service Provider
    if (isPropertyManager() && user?.role === 'Property Manager') {
      return ['User', 'Tenant', 'Service Provider'].includes(targetRole);
    }

    return false;
  };

  // Check if user can manage/edit another user based on role hierarchy
  const canManageUser = (targetUserRole: string) => {
    if (!canManageUsers()) return false;

    // Can only manage users with lower authority
    return hasHigherAuthorityThan(targetUserRole);
  };

  // Feature access based on role
  const getAvailableFeatures = () => {
    const features = [];

    if (canAccessTemplateLibrary()) {
      features.push('templates');
    }

    if (canAccessPowerTools()) {
      features.push('power_tools');
    }

    if (canViewAnalytics()) {
      features.push('analytics');
    }

    if (canManageProperties()) {
      features.push('properties');
    }

    if (canManageUsers()) {
      features.push('user_management');
    }

    if (canEditCompanySettings()) {
      features.push('company_settings');
    }

    if (canAccessSystemSettings()) {
      features.push('system_settings');
    }

    return features;
  };

  // Navigation items based on role
  const getNavigationItems = () => {
    const items = [];

    // Basic navigation for all authenticated users
    items.push(
      { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
      { label: 'Properties', path: '/properties', icon: 'home' },
    );

    if (canAccessTemplateLibrary()) {
      items.push({ label: 'Templates', path: '/templates', icon: 'description' });
    }

    if (canAccessPowerTools()) {
      items.push({ label: 'Power Tools', path: '/power-tools', icon: 'build' });
    }

    if (canViewAnalytics()) {
      items.push({ label: 'Analytics', path: '/analytics', icon: 'analytics' });
    }

    if (canManageUsers()) {
      items.push({ label: 'User Management', path: '/users', icon: 'people' });
    }

    if (isSuperAdmin() || isAdmin()) {
      items.push({ label: 'Settings', path: '/settings', icon: 'settings' });
    }

    return items;
  };

  return {
    // Current user info
    user,
    userRole: user?.role,
    userPermissions: user?.permissions || [],

    // Role checkers
    isSuperAdmin,
    isAdmin,
    isManager,
    isPropertyManager,
    isUser,
    isTenant,
    isServiceProvider,

    // Hierarchy functions
    getRoleLevel,
    hasHigherAuthorityThan,
    canManageUser,

    // Permission checkers
    canManageUsers,
    canManageCompany,
    canManageTemplates,
    canViewAnalytics,
    canManageProperties,
    canAccessSystemSettings,

    // Feature-specific permissions
    canCreateTemplates,
    canEditTemplates,
    canDeleteTemplates,
    canAccessTemplateLibrary,
    canEditCompanySettings,
    canViewCompanySettings,
    canAccessPowerTools,
    canCreateQRCodes,
    canManageContests,
    canCreateUsers,
    canEditUsers,
    canDeleteUsers,
    canViewAllUsers,
    canAssignRole,

    // Utility functions
    getAvailableFeatures,
    getNavigationItems,
    hasPermission,
  };
};

export default useRoleManagement;
