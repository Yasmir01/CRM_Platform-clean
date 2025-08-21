import { LocalStorageService } from './LocalStorageService';
import { ActivityTrackingService } from './ActivityTrackingService';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  metadata: {
    department?: string;
    jobTitle?: string;
    phoneNumber?: string;
    timezone?: string;
    language?: string;
    twoFactorEnabled: boolean;
    passwordLastChanged?: string;
    loginAttempts: number;
    lastLoginIP?: string;
  };
}

interface Role {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'custom';
  permissions: Permission[];
  hierarchy: number; // Higher number = more senior role
  inheritsFrom?: string[]; // Role IDs this role inherits permissions from
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface Permission {
  id: string;
  resource: string; // e.g., 'properties', 'tenants', 'documents'
  action: string; // e.g., 'create', 'read', 'update', 'delete', 'manage'
  scope: 'all' | 'own' | 'team' | 'assigned' | 'custom'; // Data access scope
  conditions?: PermissionCondition[];
  metadata?: {
    description?: string;
    category?: string;
    riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  };
}

interface PermissionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than' | 'contains';
  value: any;
  description?: string;
}

interface UserRole {
  userId: string;
  roleId: string;
  assignedBy: string;
  assignedAt: string;
  expiresAt?: string;
  isActive: boolean;
  metadata?: {
    reason?: string;
    temporaryAccess?: boolean;
    restrictedResources?: string[];
  };
}

interface AccessRequest {
  id: string;
  userId: string;
  requestedPermissions: Permission[];
  requestedRoles: string[];
  reason: string;
  justification: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  expiresAt?: string;
  metadata?: {
    urgency?: 'low' | 'medium' | 'high' | 'critical';
    businessCase?: string;
    temporaryAccess?: boolean;
    accessDuration?: number; // days
  };
}

interface AccessAuditLog {
  id: string;
  userId: string;
  action: 'permission_granted' | 'permission_revoked' | 'role_assigned' | 'role_removed' | 'access_denied' | 'login' | 'logout' | 'password_changed' | 'account_locked';
  resource?: string;
  resourceId?: string;
  previousValue?: any;
  newValue?: any;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
  performedBy?: string;
  sessionId?: string;
  riskScore?: number;
  metadata?: Record<string, any>;
}

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  type: 'password' | 'session' | 'access' | 'data' | 'audit';
  rules: SecurityRule[];
  isActive: boolean;
  enforcementLevel: 'advisory' | 'warning' | 'blocking';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface SecurityRule {
  id: string;
  name: string;
  condition: string; // JavaScript expression
  action: 'allow' | 'deny' | 'require_approval' | 'log_only' | 'mfa_required';
  message?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
}

interface AccessControlConfig {
  defaultUserRole: string;
  sessionTimeout: number; // minutes
  maxLoginAttempts: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number; // days
    historyCount: number; // prevent reusing last N passwords
  };
  mfaPolicy: {
    required: boolean;
    requiredForRoles: string[];
    requiredForActions: string[];
    methods: ('totp' | 'sms' | 'email' | 'hardware')[];
  };
  auditPolicy: {
    retentionDays: number;
    logAllActions: boolean;
    logFailedOnly: boolean;
    alertOnSuspiciousActivity: boolean;
  };
}

export class AccessControlService {
  private users: Map<string, User> = new Map();
  private roles: Map<string, Role> = new Map();
  private userRoles: Map<string, UserRole[]> = new Map(); // userId -> roles
  private accessRequests: Map<string, AccessRequest> = new Map();
  private auditLogs: AccessAuditLog[] = [];
  private securityPolicies: Map<string, SecurityPolicy> = new Map();
  private config: AccessControlConfig;
  private currentUser: User | null = null;

  constructor() {
    this.config = this.loadConfig();
    this.loadData();
    this.initializeDefaultRoles();
  }

  /**
   * Check if user has permission for a specific action on a resource
   */
  hasPermission(
    userId: string,
    resource: string,
    action: string,
    resourceData?: any,
    context?: Record<string, any>
  ): Promise<{ allowed: boolean; reason?: string; requiresMFA?: boolean }> {
    return new Promise((resolve) => {
      try {
        const user = this.users.get(userId);
        if (!user || user.status !== 'active') {
          this.logAccess({
            userId,
            action: 'access_denied',
            resource,
            success: false,
            failureReason: 'User not found or inactive'
          });
          resolve({ allowed: false, reason: 'User not found or inactive' });
          return;
        }

        // Get user roles and permissions
        const userRoles = this.getUserRoles(userId);
        const permissions = this.getUserPermissions(userId);

        // Check for matching permission
        const matchingPermission = permissions.find(p => 
          p.resource === resource && 
          (p.action === action || p.action === 'manage') &&
          this.evaluatePermissionConditions(p, resourceData, context)
        );

        if (!matchingPermission) {
          this.logAccess({
            userId,
            action: 'access_denied',
            resource,
            resourceId: resourceData?.id,
            success: false,
            failureReason: 'No matching permission found'
          });
          resolve({ allowed: false, reason: 'Insufficient permissions' });
          return;
        }

        // Check scope restrictions
        if (!this.checkScopeAccess(matchingPermission, userId, resourceData, context)) {
          this.logAccess({
            userId,
            action: 'access_denied',
            resource,
            resourceId: resourceData?.id,
            success: false,
            failureReason: 'Scope restrictions not met'
          });
          resolve({ allowed: false, reason: 'Access scope restrictions' });
          return;
        }

        // Check security policies
        const policyResult = this.evaluateSecurityPolicies(userId, resource, action, resourceData, context);
        if (policyResult.deny) {
          this.logAccess({
            userId,
            action: 'access_denied',
            resource,
            resourceId: resourceData?.id,
            success: false,
            failureReason: policyResult.reason
          });
          resolve({ allowed: false, reason: policyResult.reason });
          return;
        }

        // Check if MFA is required
        const requiresMFA = this.checkMFARequirement(userId, resource, action, userRoles);

        this.logAccess({
          userId,
          action: 'permission_granted',
          resource,
          resourceId: resourceData?.id,
          success: true,
          metadata: { permission: matchingPermission.id, requiresMFA }
        });

        resolve({ 
          allowed: true, 
          requiresMFA,
          reason: requiresMFA ? 'MFA verification required' : undefined 
        });

      } catch (error) {
        console.error('Error checking permission:', error);
        this.logAccess({
          userId,
          action: 'access_denied',
          resource,
          success: false,
          failureReason: 'System error during permission check'
        });
        resolve({ allowed: false, reason: 'System error' });
      }
    });
  }

  /**
   * Assign role to user
   */
  assignRole(
    userId: string,
    roleId: string,
    assignedBy: string,
    metadata?: {
      reason?: string;
      expiresAt?: string;
      temporaryAccess?: boolean;
    }
  ): boolean {
    try {
      const user = this.users.get(userId);
      const role = this.roles.get(roleId);
      
      if (!user || !role) {
        throw new Error('User or role not found');
      }

      const userRole: UserRole = {
        userId,
        roleId,
        assignedBy,
        assignedAt: new Date().toISOString(),
        expiresAt: metadata?.expiresAt,
        isActive: true,
        metadata
      };

      if (!this.userRoles.has(userId)) {
        this.userRoles.set(userId, []);
      }

      // Remove existing assignment of same role
      const existingRoles = this.userRoles.get(userId)!;
      const filteredRoles = existingRoles.filter(ur => ur.roleId !== roleId);
      filteredRoles.push(userRole);
      this.userRoles.set(userId, filteredRoles);

      this.saveData();

      this.logAccess({
        userId: assignedBy,
        action: 'role_assigned',
        resource: 'user_management',
        resourceId: userId,
        success: true,
        newValue: { roleId, metadata },
        metadata: { targetUserId: userId, roleName: role.name }
      });

      return true;
    } catch (error) {
      console.error('Error assigning role:', error);
      return false;
    }
  }

  /**
   * Remove role from user
   */
  removeRole(userId: string, roleId: string, removedBy: string, reason?: string): boolean {
    try {
      const userRoles = this.userRoles.get(userId);
      if (!userRoles) return false;

      const roleToRemove = userRoles.find(ur => ur.roleId === roleId && ur.isActive);
      if (!roleToRemove) return false;

      // Deactivate the role assignment
      roleToRemove.isActive = false;
      this.saveData();

      this.logAccess({
        userId: removedBy,
        action: 'role_removed',
        resource: 'user_management',
        resourceId: userId,
        success: true,
        previousValue: { roleId },
        metadata: { targetUserId: userId, reason }
      });

      return true;
    } catch (error) {
      console.error('Error removing role:', error);
      return false;
    }
  }

  /**
   * Create access request
   */
  createAccessRequest(
    userId: string,
    requestedPermissions: Permission[],
    requestedRoles: string[],
    reason: string,
    justification: string,
    metadata?: AccessRequest['metadata']
  ): AccessRequest {
    const request: AccessRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      requestedPermissions,
      requestedRoles,
      reason,
      justification,
      requestedBy: userId,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      metadata
    };

    this.accessRequests.set(request.id, request);
    this.saveData();

    // Log the request
    this.logAccess({
      userId,
      action: 'access_denied', // Indicates they tried to access something they don't have permission for
      resource: 'access_request',
      resourceId: request.id,
      success: true,
      metadata: { reason, justification }
    });

    return request;
  }

  /**
   * Approve access request
   */
  approveAccessRequest(requestId: string, approvedBy: string): boolean {
    try {
      const request = this.accessRequests.get(requestId);
      if (!request || request.status !== 'pending') {
        return false;
      }

      // Assign requested roles
      request.requestedRoles.forEach(roleId => {
        this.assignRole(request.userId, roleId, approvedBy, {
          reason: `Approved access request: ${request.reason}`,
          temporaryAccess: request.metadata?.temporaryAccess,
          expiresAt: request.metadata?.accessDuration 
            ? new Date(Date.now() + request.metadata.accessDuration * 24 * 60 * 60 * 1000).toISOString()
            : undefined
        });
      });

      // Update request status
      request.status = 'approved';
      request.approvedBy = approvedBy;
      request.approvedAt = new Date().toISOString();

      this.saveData();

      this.logAccess({
        userId: approvedBy,
        action: 'permission_granted',
        resource: 'access_request',
        resourceId: requestId,
        success: true,
        metadata: { targetUserId: request.userId, requestReason: request.reason }
      });

      return true;
    } catch (error) {
      console.error('Error approving access request:', error);
      return false;
    }
  }

  /**
   * Reject access request
   */
  rejectAccessRequest(requestId: string, rejectedBy: string, rejectionReason: string): boolean {
    try {
      const request = this.accessRequests.get(requestId);
      if (!request || request.status !== 'pending') {
        return false;
      }

      request.status = 'rejected';
      request.rejectedBy = rejectedBy;
      request.rejectedAt = new Date().toISOString();
      request.rejectionReason = rejectionReason;

      this.saveData();

      this.logAccess({
        userId: rejectedBy,
        action: 'access_denied',
        resource: 'access_request',
        resourceId: requestId,
        success: true,
        metadata: { 
          targetUserId: request.userId, 
          requestReason: request.reason,
          rejectionReason 
        }
      });

      return true;
    } catch (error) {
      console.error('Error rejecting access request:', error);
      return false;
    }
  }

  /**
   * Get user permissions (aggregated from all roles)
   */
  getUserPermissions(userId: string): Permission[] {
    const userRoles = this.getUserRoles(userId);
    const permissions: Permission[] = [];
    const seenPermissions = new Set<string>();

    userRoles.forEach(roleId => {
      const role = this.roles.get(roleId);
      if (role && role.isActive) {
        role.permissions.forEach(permission => {
          const key = `${permission.resource}:${permission.action}:${permission.scope}`;
          if (!seenPermissions.has(key)) {
            permissions.push(permission);
            seenPermissions.add(key);
          }
        });

        // Add inherited permissions
        if (role.inheritsFrom) {
          role.inheritsFrom.forEach(inheritedRoleId => {
            const inheritedRole = this.roles.get(inheritedRoleId);
            if (inheritedRole && inheritedRole.isActive) {
              inheritedRole.permissions.forEach(permission => {
                const key = `${permission.resource}:${permission.action}:${permission.scope}`;
                if (!seenPermissions.has(key)) {
                  permissions.push(permission);
                  seenPermissions.add(key);
                }
              });
            }
          });
        }
      }
    });

    return permissions;
  }

  /**
   * Get user roles
   */
  getUserRoles(userId: string): string[] {
    const userRoles = this.userRoles.get(userId) || [];
    const now = new Date();
    
    return userRoles
      .filter(ur => 
        ur.isActive && 
        (!ur.expiresAt || new Date(ur.expiresAt) > now)
      )
      .map(ur => ur.roleId);
  }

  /**
   * Get access audit logs
   */
  getAuditLogs(filters?: {
    userId?: string;
    resource?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    success?: boolean;
  }): AccessAuditLog[] {
    let logs = [...this.auditLogs];

    if (filters) {
      if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId);
      }
      if (filters.resource) {
        logs = logs.filter(log => log.resource === filters.resource);
      }
      if (filters.action) {
        logs = logs.filter(log => log.action === filters.action);
      }
      if (filters.success !== undefined) {
        logs = logs.filter(log => log.success === filters.success);
      }
      if (filters.startDate) {
        logs = logs.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        logs = logs.filter(log => log.timestamp <= filters.endDate!);
      }
    }

    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Generate security report
   */
  generateSecurityReport(): {
    summary: {
      totalUsers: number;
      activeUsers: number;
      totalRoles: number;
      totalPermissions: number;
      pendingRequests: number;
      securityIncidents: number;
    };
    riskAnalysis: {
      highRiskActions: number;
      suspiciousActivity: number;
      failedLoginAttempts: number;
      privilegedUsers: number;
    };
    recommendations: string[];
  } {
    const totalUsers = this.users.size;
    const activeUsers = Array.from(this.users.values()).filter(u => u.status === 'active').length;
    const totalRoles = this.roles.size;
    const totalPermissions = Array.from(this.roles.values()).reduce((sum, role) => sum + role.permissions.length, 0);
    const pendingRequests = Array.from(this.accessRequests.values()).filter(r => r.status === 'pending').length;
    const securityIncidents = this.auditLogs.filter(log => !log.success).length;

    const highRiskActions = this.auditLogs.filter(log => log.riskScore && log.riskScore > 7).length;
    const suspiciousActivity = this.auditLogs.filter(log => 
      log.action === 'access_denied' && 
      new Date(log.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
    ).length;
    const failedLoginAttempts = this.auditLogs.filter(log => 
      log.action === 'login' && !log.success
    ).length;
    const privilegedUsers = Array.from(this.userRoles.values()).filter(roles => 
      roles.some(role => {
        const r = this.roles.get(role.roleId);
        return r && r.hierarchy >= 8; // High hierarchy roles
      })
    ).length;

    const recommendations: string[] = [];
    
    if (pendingRequests > 5) {
      recommendations.push('Review pending access requests to avoid security delays');
    }
    if (failedLoginAttempts > 10) {
      recommendations.push('Investigate multiple failed login attempts');
    }
    if (privilegedUsers > totalUsers * 0.1) {
      recommendations.push('Review privileged user assignments - too many users have high-level access');
    }
    if (suspiciousActivity > 20) {
      recommendations.push('High number of access denials detected - review user permissions');
    }

    return {
      summary: {
        totalUsers,
        activeUsers,
        totalRoles,
        totalPermissions,
        pendingRequests,
        securityIncidents
      },
      riskAnalysis: {
        highRiskActions,
        suspiciousActivity,
        failedLoginAttempts,
        privilegedUsers
      },
      recommendations
    };
  }

  /**
   * Create custom role
   */
  createRole(
    name: string,
    description: string,
    permissions: Permission[],
    createdBy: string,
    hierarchy: number = 1,
    inheritsFrom?: string[]
  ): Role {
    const role: Role = {
      id: `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      type: 'custom',
      permissions,
      hierarchy,
      inheritsFrom,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy
    };

    this.roles.set(role.id, role);
    this.saveData();

    this.logAccess({
      userId: createdBy,
      action: 'role_assigned',
      resource: 'role_management',
      resourceId: role.id,
      success: true,
      newValue: { name, permissions: permissions.length },
      metadata: { roleName: name }
    });

    return role;
  }

  /**
   * Private helper methods
   */
  private evaluatePermissionConditions(
    permission: Permission,
    resourceData?: any,
    context?: Record<string, any>
  ): boolean {
    if (!permission.conditions || permission.conditions.length === 0) {
      return true;
    }

    return permission.conditions.every(condition => {
      const value = resourceData?.[condition.field] || context?.[condition.field];
      
      switch (condition.operator) {
        case 'equals':
          return value === condition.value;
        case 'not_equals':
          return value !== condition.value;
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(value);
        case 'not_in':
          return Array.isArray(condition.value) && !condition.value.includes(value);
        case 'greater_than':
          return Number(value) > Number(condition.value);
        case 'less_than':
          return Number(value) < Number(condition.value);
        case 'contains':
          return String(value).toLowerCase().includes(String(condition.value).toLowerCase());
        default:
          return false;
      }
    });
  }

  private checkScopeAccess(
    permission: Permission,
    userId: string,
    resourceData?: any,
    context?: Record<string, any>
  ): boolean {
    switch (permission.scope) {
      case 'all':
        return true;
      case 'own':
        return resourceData?.ownerId === userId || resourceData?.createdBy === userId;
      case 'team':
        // Check if user is in same team/department
        const user = this.users.get(userId);
        return user?.metadata.department === resourceData?.department;
      case 'assigned':
        return resourceData?.assignedTo === userId || resourceData?.assignedUsers?.includes(userId);
      case 'custom':
        // Custom scope logic would be implemented here
        return true;
      default:
        return false;
    }
  }

  private evaluateSecurityPolicies(
    userId: string,
    resource: string,
    action: string,
    resourceData?: any,
    context?: Record<string, any>
  ): { deny: boolean; reason?: string } {
    const activePolicies = Array.from(this.securityPolicies.values()).filter(p => p.isActive);
    
    for (const policy of activePolicies) {
      for (const rule of policy.rules.filter(r => r.isActive)) {
        try {
          // Evaluate rule condition (simplified - in real implementation would use a secure evaluator)
          const shouldApply = this.evaluateRuleCondition(rule.condition, {
            userId,
            resource,
            action,
            resourceData,
            context,
            user: this.users.get(userId)
          });

          if (shouldApply && rule.action === 'deny') {
            return { deny: true, reason: rule.message || 'Access denied by security policy' };
          }
        } catch (error) {
          console.error('Error evaluating security rule:', error);
        }
      }
    }

    return { deny: false };
  }

  private evaluateRuleCondition(condition: string, variables: any): boolean {
    // Simplified rule evaluation - in production, use a secure expression evaluator
    try {
      // Basic string matching for demo purposes
      if (condition.includes('high_risk_action') && variables.action === 'delete') {
        return true;
      }
      if (condition.includes('after_hours') && new Date().getHours() < 8 || new Date().getHours() > 18) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private checkMFARequirement(userId: string, resource: string, action: string, userRoles: string[]): boolean {
    if (!this.config.mfaPolicy.required) return false;

    // Check if MFA required for any of user's roles
    const hasRequiredRole = userRoles.some(roleId => 
      this.config.mfaPolicy.requiredForRoles.includes(roleId)
    );

    // Check if MFA required for this action
    const isRequiredAction = this.config.mfaPolicy.requiredForActions.includes(action);

    return hasRequiredRole || isRequiredAction;
  }

  private logAccess(log: Omit<AccessAuditLog, 'id' | 'timestamp'>): void {
    const auditLog: AccessAuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...log
    };

    this.auditLogs.unshift(auditLog);

    // Keep only last 10000 logs
    if (this.auditLogs.length > 10000) {
      this.auditLogs = this.auditLogs.slice(0, 10000);
    }

    this.saveData();

    // Track in activity service
    ActivityTrackingService.trackActivity({
      userId: log.userId,
      activityType: 'access_control',
      entityType: 'security',
      entityId: log.resource || 'system',
      metadata: {
        action: log.action,
        success: log.success,
        resource: log.resource,
        failureReason: log.failureReason
      }
    });
  }

  private initializeDefaultRoles(): void {
    if (this.roles.size === 0) {
      // Super Admin Role (Highest Authority - Level 10)
      this.roles.set('super_admin', {
        id: 'super_admin',
        name: 'Super Administrator',
        description: 'Full system access with all permissions',
        type: 'system',
        permissions: [
          { id: 'manage_all', resource: '*', action: 'manage', scope: 'all' }
        ],
        hierarchy: 10,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
      });

      // Admin Role (High Authority - Level 8)
      this.roles.set('admin', {
        id: 'admin',
        name: 'Administrator',
        description: 'High level access to manage company operations',
        type: 'system',
        permissions: [
          { id: 'manage_company', resource: 'company', action: 'manage', scope: 'all' },
          { id: 'manage_templates', resource: 'templates', action: 'manage', scope: 'all' },
          { id: 'manage_properties', resource: 'properties', action: 'manage', scope: 'all' },
          { id: 'manage_tenants', resource: 'tenants', action: 'manage', scope: 'all' },
          { id: 'view_analytics', resource: 'analytics', action: 'read', scope: 'all' }
        ],
        hierarchy: 8,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
      });

      // Manager Role (Medium-High Authority - Level 6)
      this.roles.set('manager', {
        id: 'manager',
        name: 'Manager',
        description: 'Regional or departmental management access',
        type: 'system',
        permissions: [
          { id: 'manage_properties', resource: 'properties', action: 'manage', scope: 'assigned' },
          { id: 'manage_tenants', resource: 'tenants', action: 'manage', scope: 'assigned' },
          { id: 'manage_staff', resource: 'users', action: 'manage', scope: 'subordinates' },
          { id: 'view_reports', resource: 'reports', action: 'read', scope: 'assigned' }
        ],
        hierarchy: 6,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
      });

      // Property Manager Role (Medium Authority - Level 4)
      this.roles.set('property_manager', {
        id: 'property_manager',
        name: 'Property Manager',
        description: 'Manage properties, tenants, and maintenance',
        type: 'system',
        permissions: [
          { id: 'manage_properties', resource: 'properties', action: 'manage', scope: 'assigned' },
          { id: 'manage_tenants', resource: 'tenants', action: 'manage', scope: 'assigned' },
          { id: 'manage_maintenance', resource: 'workorders', action: 'manage', scope: 'assigned' },
          { id: 'view_reports', resource: 'reports', action: 'read', scope: 'assigned' }
        ],
        hierarchy: 4,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
      });

      // User Role (Standard Authority - Level 2)
      this.roles.set('user', {
        id: 'user',
        name: 'User',
        description: 'Standard user access for viewing and basic operations',
        type: 'system',
        permissions: [
          { id: 'view_properties', resource: 'properties', action: 'read', scope: 'assigned' },
          { id: 'view_tenants', resource: 'tenants', action: 'read', scope: 'assigned' },
          { id: 'view_reports', resource: 'reports', action: 'read', scope: 'basic' },
          { id: 'send_communications', resource: 'communications', action: 'create', scope: 'basic' }
        ],
        hierarchy: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
      });

      // Tenant Role (Limited Authority - Level 1)
      this.roles.set('tenant', {
        id: 'tenant',
        name: 'Tenant',
        description: 'Basic tenant access to own information',
        type: 'system',
        permissions: [
          { id: 'view_own_lease', resource: 'leases', action: 'read', scope: 'own' },
          { id: 'create_maintenance', resource: 'workorders', action: 'create', scope: 'own' },
          { id: 'view_own_payments', resource: 'payments', action: 'read', scope: 'own' }
        ],
        hierarchy: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system'
      });

      this.saveData();
    }
  }

  private loadConfig(): AccessControlConfig {
    try {
      const saved = LocalStorageService.getItem('access_control_config');
      if (saved) return saved;
    } catch (error) {
      console.error('Error loading access control config:', error);
    }

    return {
      defaultUserRole: 'tenant',
      sessionTimeout: 480, // 8 hours
      maxLoginAttempts: 5,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90,
        historyCount: 5
      },
      mfaPolicy: {
        required: false,
        requiredForRoles: ['super_admin', 'property_manager'],
        requiredForActions: ['delete', 'manage_users'],
        methods: ['totp', 'email']
      },
      auditPolicy: {
        retentionDays: 365,
        logAllActions: true,
        logFailedOnly: false,
        alertOnSuspiciousActivity: true
      }
    };
  }

  private loadData(): void {
    try {
      const users = LocalStorageService.getItem('access_control_users');
      if (users) {
        this.users = new Map(Object.entries(users));
      }

      const roles = LocalStorageService.getItem('access_control_roles');
      if (roles) {
        this.roles = new Map(Object.entries(roles));
      }

      const userRoles = LocalStorageService.getItem('access_control_user_roles');
      if (userRoles) {
        this.userRoles = new Map(Object.entries(userRoles));
      }

      const requests = LocalStorageService.getItem('access_control_requests');
      if (requests) {
        this.accessRequests = new Map(Object.entries(requests));
      }

      const logs = LocalStorageService.getItem('access_control_audit_logs');
      if (logs && Array.isArray(logs)) {
        this.auditLogs = logs;
      }

      const policies = LocalStorageService.getItem('access_control_security_policies');
      if (policies) {
        this.securityPolicies = new Map(Object.entries(policies));
      }
    } catch (error) {
      console.error('Error loading access control data:', error);
    }
  }

  private saveData(): void {
    try {
      LocalStorageService.setItem('access_control_users', Object.fromEntries(this.users));
      LocalStorageService.setItem('access_control_roles', Object.fromEntries(this.roles));
      LocalStorageService.setItem('access_control_user_roles', Object.fromEntries(this.userRoles));
      LocalStorageService.setItem('access_control_requests', Object.fromEntries(this.accessRequests));
      LocalStorageService.setItem('access_control_audit_logs', this.auditLogs);
      LocalStorageService.setItem('access_control_security_policies', Object.fromEntries(this.securityPolicies));
      LocalStorageService.setItem('access_control_config', this.config);
    } catch (error) {
      console.error('Error saving access control data:', error);
    }
  }
}

export const accessControlService = new AccessControlService();
