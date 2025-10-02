import { LocalStorageService } from './LocalStorageService';
import activityTracker from './ActivityTrackingService';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended' | 'locked';
  role: string;
  permissions: string[];
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
    activatedBy?: string;
    deactivatedBy?: string;
    activatedAt?: string;
    deactivatedAt?: string;
    deactivationReason?: string;
    suspensionReason?: string;
    notes?: string;
  };
}

export interface UserAction {
  id: string;
  userId: string;
  action: 'create' | 'activate' | 'deactivate' | 'suspend' | 'unsuspend' | 'lock' | 'unlock' | 'delete' | 'role_change' | 'permission_change';
  performedBy: string;
  performedAt: string;
  reason?: string;
  previousValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface BulkUserAction {
  id: string;
  userIds: string[];
  action: 'activate' | 'deactivate' | 'suspend' | 'delete' | 'role_assign';
  performedBy: string;
  performedAt: string;
  reason?: string;
  newRole?: string;
  results: {
    successful: string[];
    failed: { userId: string; reason: string }[];
  };
}

export class UserManagementService {
  private users: Map<string, User> = new Map();
  private userActions: UserAction[] = [];
  private bulkActions: BulkUserAction[] = [];

  constructor() {
    this.loadData();
    this.initializeMockData();
  }

  /**
   * Get all users with optional filtering
   */
  getUsers(filters?: {
    status?: User['status'];
    role?: string;
    department?: string;
    searchTerm?: string;
  }): User[] {
    let userList = Array.from(this.users.values());

    if (filters) {
      if (filters.status) {
        userList = userList.filter(user => user.status === filters.status);
      }
      if (filters.role) {
        userList = userList.filter(user => user.role === filters.role);
      }
      if (filters.department) {
        userList = userList.filter(user => user.metadata.department === filters.department);
      }
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        userList = userList.filter(user =>
          user.firstName.toLowerCase().includes(term) ||
          user.lastName.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
        );
      }
    }

    return userList;
  }

  /**
   * Get user by ID
   */
  getUser(userId: string): User | null {
    return this.users.get(userId) || null;
  }

  /**
   * Create new user
   */
  createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, createdBy: string): User {
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.set(newUser.id, newUser);
    
    this.logUserAction({
      userId: newUser.id,
      action: 'create',
      performedBy: createdBy,
      reason: 'User account created'
    });

    this.saveData();
    return newUser;
  }

  /**
   * Activate user account
   */
  activateUser(userId: string, activatedBy: string, reason?: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    if (user.status === 'active') {
      throw new Error('User is already active');
    }

    const updatedUser: User = {
      ...user,
      status: 'active',
      updatedAt: new Date().toISOString(),
      metadata: {
        ...user.metadata,
        activatedBy,
        activatedAt: new Date().toISOString(),
        loginAttempts: 0 // Reset login attempts on activation
      }
    };

    this.users.set(userId, updatedUser);

    this.logUserAction({
      userId,
      action: 'activate',
      performedBy: activatedBy,
      reason: reason || 'User account activated',
      previousValue: { status: user.status },
      newValue: { status: 'active' }
    });

    // Track activity
    activityTracker.trackActivity({
      userId: activatedBy,
      activityType: 'user_management',
      entityType: 'user',
      entityId: userId,
      metadata: {
        action: 'activate',
        targetUser: `${user.firstName} ${user.lastName}`,
        reason
      }
    });

    this.saveData();
    return true;
  }

  /**
   * Deactivate user account
   */
  deactivateUser(userId: string, deactivatedBy: string, reason?: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    if (user.status === 'inactive') {
      throw new Error('User is already inactive');
    }

    // Prevent super admin from being deactivated
    if (user.role === 'Super Admin' || user.role === 'super_admin') {
      throw new Error('Super Admin cannot be deactivated');
    }

    const updatedUser: User = {
      ...user,
      status: 'inactive',
      updatedAt: new Date().toISOString(),
      metadata: {
        ...user.metadata,
        deactivatedBy,
        deactivatedAt: new Date().toISOString(),
        deactivationReason: reason
      }
    };

    this.users.set(userId, updatedUser);

    this.logUserAction({
      userId,
      action: 'deactivate',
      performedBy: deactivatedBy,
      reason: reason || 'User account deactivated',
      previousValue: { status: user.status },
      newValue: { status: 'inactive' }
    });

    // Track activity
    activityTracker.trackActivity({
      userId: deactivatedBy,
      activityType: 'user_management',
      entityType: 'user',
      entityId: userId,
      metadata: {
        action: 'deactivate',
        targetUser: `${user.firstName} ${user.lastName}`,
        reason
      }
    });

    this.saveData();
    return true;
  }

  /**
   * Suspend user account
   */
  suspendUser(userId: string, suspendedBy: string, reason: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    if (user.status === 'suspended') {
      throw new Error('User is already suspended');
    }

    // Prevent super admin from being suspended
    if (user.role === 'Super Admin' || user.role === 'super_admin') {
      throw new Error('Super Admin cannot be suspended');
    }

    const updatedUser: User = {
      ...user,
      status: 'suspended',
      updatedAt: new Date().toISOString(),
      metadata: {
        ...user.metadata,
        suspensionReason: reason
      }
    };

    this.users.set(userId, updatedUser);

    this.logUserAction({
      userId,
      action: 'suspend',
      performedBy: suspendedBy,
      reason,
      previousValue: { status: user.status },
      newValue: { status: 'suspended' }
    });

    // Track activity
    activityTracker.trackActivity({
      userId: suspendedBy,
      activityType: 'user_management',
      entityType: 'user',
      entityId: userId,
      metadata: {
        action: 'suspend',
        targetUser: `${user.firstName} ${user.lastName}`,
        reason
      }
    });

    this.saveData();
    return true;
  }

  /**
   * Unsuspend user account
   */
  unsuspendUser(userId: string, unsuspendedBy: string, reason?: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    if (user.status !== 'suspended') {
      throw new Error('User is not suspended');
    }

    const updatedUser: User = {
      ...user,
      status: 'active',
      updatedAt: new Date().toISOString(),
      metadata: {
        ...user.metadata,
        suspensionReason: undefined
      }
    };

    this.users.set(userId, updatedUser);

    this.logUserAction({
      userId,
      action: 'unsuspend',
      performedBy: unsuspendedBy,
      reason: reason || 'User suspension lifted',
      previousValue: { status: user.status },
      newValue: { status: 'active' }
    });

    // Track activity
    activityTracker.trackActivity({
      userId: unsuspendedBy,
      activityType: 'user_management',
      entityType: 'user',
      entityId: userId,
      metadata: {
        action: 'unsuspend',
        targetUser: `${user.firstName} ${user.lastName}`,
        reason
      }
    });

    this.saveData();
    return true;
  }

  /**
   * Lock user account (for security reasons)
   */
  lockUser(userId: string, lockedBy: string, reason: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    if (user.status === 'locked') {
      throw new Error('User is already locked');
    }

    const updatedUser: User = {
      ...user,
      status: 'locked',
      updatedAt: new Date().toISOString(),
      metadata: {
        ...user.metadata,
        notes: reason
      }
    };

    this.users.set(userId, updatedUser);

    this.logUserAction({
      userId,
      action: 'lock',
      performedBy: lockedBy,
      reason,
      previousValue: { status: user.status },
      newValue: { status: 'locked' }
    });

    this.saveData();
    return true;
  }

  /**
   * Unlock user account
   */
  unlockUser(userId: string, unlockedBy: string, reason?: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    if (user.status !== 'locked') {
      throw new Error('User is not locked');
    }

    const updatedUser: User = {
      ...user,
      status: 'active',
      updatedAt: new Date().toISOString(),
      metadata: {
        ...user.metadata,
        loginAttempts: 0,
        notes: undefined
      }
    };

    this.users.set(userId, updatedUser);

    this.logUserAction({
      userId,
      action: 'unlock',
      performedBy: unlockedBy,
      reason: reason || 'User account unlocked',
      previousValue: { status: user.status },
      newValue: { status: 'active' }
    });

    this.saveData();
    return true;
  }

  /**
   * Change user role
   */
  changeUserRole(userId: string, newRole: string, changedBy: string, reason?: string): boolean {
    const user = this.users.get(userId);
    if (!user) return false;

    const previousRole = user.role;
    if (previousRole === newRole) {
      throw new Error('User already has this role');
    }

    // Prevent changing super admin role
    if (user.role === 'Super Admin' || user.role === 'super_admin') {
      throw new Error('Super Admin role cannot be changed');
    }

    const updatedUser: User = {
      ...user,
      role: newRole,
      updatedAt: new Date().toISOString(),
    };

    this.users.set(userId, updatedUser);

    this.logUserAction({
      userId,
      action: 'role_change',
      performedBy: changedBy,
      reason: reason || 'User role changed',
      previousValue: { role: previousRole },
      newValue: { role: newRole }
    });

    // Track activity
    activityTracker.trackActivity({
      userId: changedBy,
      activityType: 'user_management',
      entityType: 'user',
      entityId: userId,
      metadata: {
        action: 'role_change',
        targetUser: `${user.firstName} ${user.lastName}`,
        previousRole,
        newRole,
        reason
      }
    });

    this.saveData();
    return true;
  }

  /**
   * Bulk activate users
   */
  bulkActivateUsers(userIds: string[], performedBy: string, reason?: string): BulkUserAction {
    const results = {
      successful: [] as string[],
      failed: [] as { userId: string; reason: string }[]
    };

    userIds.forEach(userId => {
      try {
        this.activateUser(userId, performedBy, reason);
        results.successful.push(userId);
      } catch (error) {
        results.failed.push({
          userId,
          reason: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    const bulkAction: BulkUserAction = {
      id: `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userIds,
      action: 'activate',
      performedBy,
      performedAt: new Date().toISOString(),
      reason,
      results
    };

    this.bulkActions.push(bulkAction);
    this.saveData();

    return bulkAction;
  }

  /**
   * Bulk deactivate users
   */
  bulkDeactivateUsers(userIds: string[], performedBy: string, reason?: string): BulkUserAction {
    const results = {
      successful: [] as string[],
      failed: [] as { userId: string; reason: string }[]
    };

    userIds.forEach(userId => {
      try {
        this.deactivateUser(userId, performedBy, reason);
        results.successful.push(userId);
      } catch (error) {
        results.failed.push({
          userId,
          reason: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    const bulkAction: BulkUserAction = {
      id: `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userIds,
      action: 'deactivate',
      performedBy,
      performedAt: new Date().toISOString(),
      reason,
      results
    };

    this.bulkActions.push(bulkAction);
    this.saveData();

    return bulkAction;
  }

  /**
   * Bulk assign role to users
   */
  bulkAssignRole(userIds: string[], newRole: string, performedBy: string, reason?: string): BulkUserAction {
    const results = {
      successful: [] as string[],
      failed: [] as { userId: string; reason: string }[]
    };

    userIds.forEach(userId => {
      try {
        this.changeUserRole(userId, newRole, performedBy, reason);
        results.successful.push(userId);
      } catch (error) {
        results.failed.push({
          userId,
          reason: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    const bulkAction: BulkUserAction = {
      id: `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userIds,
      action: 'role_assign',
      performedBy,
      performedAt: new Date().toISOString(),
      reason,
      newRole,
      results
    };

    this.bulkActions.push(bulkAction);
    this.saveData();

    return bulkAction;
  }

  /**
   * Get user actions history
   */
  getUserActions(userId?: string, limit: number = 50): UserAction[] {
    let actions = [...this.userActions];
    
    if (userId) {
      actions = actions.filter(action => action.userId === userId);
    }

    return actions
      .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())
      .slice(0, limit);
  }

  /**
   * Get bulk actions history
   */
  getBulkActions(limit: number = 20): BulkUserAction[] {
    return this.bulkActions
      .sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime())
      .slice(0, limit);
  }

  /**
   * Get user statistics
   */
  getUserStatistics(): {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    pending: number;
    locked: number;
    byRole: Record<string, number>;
    byDepartment: Record<string, number>;
  } {
    const users = Array.from(this.users.values());
    
    const stats = {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      inactive: users.filter(u => u.status === 'inactive').length,
      suspended: users.filter(u => u.status === 'suspended').length,
      pending: users.filter(u => u.status === 'pending').length,
      locked: users.filter(u => u.status === 'locked').length,
      byRole: {} as Record<string, number>,
      byDepartment: {} as Record<string, number>
    };

    // Count by role
    users.forEach(user => {
      stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
    });

    // Count by department
    users.forEach(user => {
      const dept = user.metadata.department || 'Unassigned';
      stats.byDepartment[dept] = (stats.byDepartment[dept] || 0) + 1;
    });

    return stats;
  }

  /**
   * Private helper methods
   */
  private logUserAction(actionData: Omit<UserAction, 'id' | 'performedAt'>): void {
    const action: UserAction = {
      ...actionData,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      performedAt: new Date().toISOString()
    };

    this.userActions.unshift(action);

    // Keep only last 1000 actions
    if (this.userActions.length > 1000) {
      this.userActions = this.userActions.slice(0, 1000);
    }
  }

  private loadData(): void {
    try {
      const users = LocalStorageService.getItem('user_management_users');
      if (users) {
        this.users = new Map(Object.entries(users));
      }

      const actions = LocalStorageService.getItem('user_management_actions');
      if (actions && Array.isArray(actions)) {
        this.userActions = actions;
      }

      const bulkActions = LocalStorageService.getItem('user_management_bulk_actions');
      if (bulkActions && Array.isArray(bulkActions)) {
        this.bulkActions = bulkActions;
      }
    } catch (error) {
      console.error('Error loading user management data:', error);
    }
  }

  private saveData(): void {
    try {
      LocalStorageService.setItem('user_management_users', Object.fromEntries(this.users));
      LocalStorageService.setItem('user_management_actions', this.userActions);
      LocalStorageService.setItem('user_management_bulk_actions', this.bulkActions);
    } catch (error) {
      console.error('Error saving user management data:', error);
    }
  }

  private initializeMockData(): void {
    if (this.users.size === 0) {
      // Create some initial users
      const mockUsers: User[] = [
        {
          id: 'super_admin_001',
          email: 'superadmin@propertycrm.com',
          firstName: 'Super',
          lastName: 'Administrator',
          status: 'active',
          role: 'Super Admin',
          permissions: ['all'],
          lastLogin: new Date().toISOString(),
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: new Date().toISOString(),
          metadata: {
            department: 'IT',
            jobTitle: 'System Administrator',
            phoneNumber: '+1-555-0100',
            timezone: 'UTC',
            language: 'en',
            twoFactorEnabled: true,
            loginAttempts: 0
          }
        },
        {
          id: 'admin_001',
          email: 'admin@propertycrm.com',
          firstName: 'John',
          lastName: 'Admin',
          status: 'active',
          role: 'Admin',
          permissions: ['properties', 'tenants', 'reports', 'users'],
          lastLogin: new Date(Date.now() - 3600000).toISOString(),
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: new Date().toISOString(),
          metadata: {
            department: 'Management',
            jobTitle: 'Administrator',
            phoneNumber: '+1-555-0101',
            timezone: 'America/New_York',
            language: 'en',
            twoFactorEnabled: true,
            loginAttempts: 0
          }
        },
        {
          id: 'manager_001',
          email: 'manager@propertycrm.com',
          firstName: 'Sarah',
          lastName: 'Manager',
          status: 'active',
          role: 'Property Manager',
          permissions: ['properties', 'tenants', 'workorders'],
          lastLogin: new Date(Date.now() - 7200000).toISOString(),
          createdAt: '2024-01-15T00:00:00Z',
          updatedAt: new Date().toISOString(),
          metadata: {
            department: 'Operations',
            jobTitle: 'Property Manager',
            phoneNumber: '+1-555-0102',
            timezone: 'America/Los_Angeles',
            language: 'en',
            twoFactorEnabled: false,
            loginAttempts: 0
          }
        },
        {
          id: 'inactive_001',
          email: 'inactive@propertycrm.com',
          firstName: 'Mike',
          lastName: 'Wilson',
          status: 'inactive',
          role: 'Property Manager',
          permissions: ['properties', 'tenants'],
          lastLogin: new Date(Date.now() - 86400000 * 7).toISOString(),
          createdAt: '2024-01-10T00:00:00Z',
          updatedAt: new Date().toISOString(),
          metadata: {
            department: 'Operations',
            jobTitle: 'Property Manager',
            phoneNumber: '+1-555-0103',
            timezone: 'America/Chicago',
            language: 'en',
            twoFactorEnabled: false,
            loginAttempts: 0,
            deactivatedBy: 'super_admin_001',
            deactivatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
            deactivationReason: 'Employee left company'
          }
        }
      ];

      mockUsers.forEach(user => {
        this.users.set(user.id, user);
      });

      this.saveData();
    }
  }
}

export const userManagementService = new UserManagementService();
