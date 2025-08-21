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
  const canAccessTemplateLibrary = () => isAdmin() || isPropertyManager();

  // Company settings access
  const canEditCompanySettings = () => canManageCompany();
  const canViewCompanySettings = () => isAdmin() || isPropertyManager();

  // Power tools access
  const canAccessPowerTools = () => isAdmin() || isPropertyManager();
  const canCreateQRCodes = () => canAccessPowerTools();
  const canManageContests = () => canAccessPowerTools();

  // User management access
  const canCreateUsers = () => canManageUsers();
  const canEditUsers = () => canManageUsers();
  const canDeleteUsers = () => canManageUsers();
  const canViewAllUsers = () => canManageUsers();

  // Role assignment (only super admin can assign admin and super admin roles)
  const canAssignRole = (targetRole: string) => {
    if (!canManageUsers()) return false;
    
    if (targetRole === 'Super Admin') {
      return isSuperAdmin();
    }
    
    if (targetRole === 'Admin') {
      return isSuperAdmin();
    }
    
    return true; // Can assign other roles if has manage_users permission
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

    if (isAdmin()) {
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
    isPropertyManager,
    isTenant,
    isServiceProvider,

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
