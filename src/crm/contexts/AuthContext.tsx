import React, { createContext, useContext, useState, useEffect } from 'react';
import { EmailService } from '../services/EmailService';

export type UserRole = 'Super Admin' | 'Admin' | 'Manager' | 'Property Manager' | 'User' | 'Tenant' | 'Service Provider';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name?: string; // Combined name for easy access
  email: string;
  phone?: string;
  role: UserRole;
  status: 'Active' | 'Inactive' | 'Pending';
  permissions: string[];
  properties?: string[]; // For Property Managers and Tenants
  serviceType?: string; // For Service Providers
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
  // User preferences
  preferredLanguage?: string;
  timezone?: string;
  countryCode?: string;
}

export interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
  addUser: (userData: Omit<User, 'id' | 'createdAt'>) => User;
  updateUser: (userId: string, userData: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  getUsersByRole: (role: UserRole) => User[];
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  sendPasswordEmail: (email: string, tempPassword: string) => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data
const mockUsers: User[] = [
  {
    id: '0',
    firstName: 'Super',
    lastName: 'Administrator',
    email: 'superadmin@propcrm.com',
    role: 'Super Admin',
    status: 'Active',
    permissions: ['all', 'manage_users', 'manage_company', 'manage_templates', 'system_settings'],
    createdAt: '2024-01-01T00:00:00Z',
    timezone: 'UTC',
    preferredLanguage: 'en',
    countryCode: 'US',
  },
  {
    id: '1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@propcrm.com',
    role: 'Admin',
    status: 'Active',
    permissions: ['manage_templates', 'manage_company', 'view_analytics', 'manage_properties'],
    createdAt: '2024-01-01T00:00:00Z',
    timezone: 'America/New_York',
    preferredLanguage: 'en',
    countryCode: 'US',
  },
  {
    id: '2',
    firstName: 'Alex',
    lastName: 'Thompson',
    email: 'alex@acmecrm.com',
    phone: '(555) 101-2020',
    role: 'Admin',
    status: 'Active',
    permissions: ['all'],
    createdAt: '2024-01-02T00:00:00Z',
    timezone: 'America/Los_Angeles',
    preferredLanguage: 'en',
    countryCode: 'US',
  },
  {
    id: '3',
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'robert.johnson@propcrm.com',
    phone: '(555) 111-2222',
    role: 'Manager',
    status: 'Active',
    permissions: ['manage_properties', 'manage_tenants', 'manage_leases', 'view_reports', 'send_communications', 'manage_maintenance', 'manage_staff'],
    properties: ['Regional Portfolio'],
    createdAt: '2024-01-03T00:00:00Z',
    timezone: 'America/Chicago',
    preferredLanguage: 'en',
    countryCode: 'US',
  },
  {
    id: '4',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@propcrm.com',
    phone: '(555) 222-3333',
    role: 'Property Manager',
    status: 'Active',
    permissions: ['manage_properties', 'manage_tenants', 'view_reports', 'send_communications'],
    properties: ['Sunset Apartments', 'Ocean View Villa'],
    createdAt: '2024-01-04T00:00:00Z',
    timezone: 'America/Denver',
    preferredLanguage: 'en',
    countryCode: 'US',
  },
  {
    id: '5',
    firstName: 'Lisa',
    lastName: 'Chen',
    email: 'lisa.chen@propcrm.com',
    phone: '(555) 444-5555',
    role: 'User',
    status: 'Active',
    permissions: ['view_properties', 'view_tenants', 'view_reports', 'send_communications'],
    createdAt: '2024-01-05T00:00:00Z',
    timezone: 'Asia/Shanghai',
    preferredLanguage: 'zh',
    countryCode: 'CN',
  },
  {
    id: '6',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    role: 'Tenant',
    status: 'Active',
    permissions: ['view_profile', 'view_lease', 'pay_rent', 'submit_maintenance'],
    properties: ['Sunset Apartments'],
    createdAt: '2024-01-06T00:00:00Z',
    timezone: 'America/New_York',
    preferredLanguage: 'en',
    countryCode: 'US',
  },
  {
    id: '7',
    firstName: 'Mike',
    lastName: 'Wilson',
    email: 'mike@handyservices.com',
    phone: '(555) 333-4444',
    role: 'Service Provider',
    status: 'Active',
    permissions: ['view_work_orders', 'update_work_status', 'submit_invoices'],
    serviceType: 'Plumbing',
    createdAt: '2024-01-07T00:00:00Z',
    timezone: 'America/Los_Angeles',
    preferredLanguage: 'en',
    countryCode: 'US',
  },
];

const rolePermissions: Record<UserRole, string[]> = {
  // HIGHEST AUTHORITY - Super Admin (Level 10)
  'Super Admin': [
    'all', // Full system access
    'manage_users', 'manage_user_roles', 'assign_admin_roles',
    'manage_company', 'manage_subscriptions', 'manage_billing',
    'system_settings', 'system_configuration', 'activate_deactivate_accounts',
    'view_all_accounts', 'view_system_analytics', 'manage_security',
    'manage_templates', 'view_analytics', 'manage_properties',
    'manage_tenants', 'manage_leases', 'view_reports', 'send_communications',
    'manage_maintenance', 'manage_finances', 'manage_documents',
    'delete_charges', 'add_credits', 'view_financial_ledger'
  ],

  // HIGH AUTHORITY - Admin (Level 8)
  'Admin': [
    'manage_templates', 'manage_company', 'view_analytics',
    'manage_properties', 'manage_tenants', 'manage_leases',
    'view_reports', 'send_communications', 'manage_maintenance',
    'manage_finances', 'manage_documents', 'delete_charges',
    'add_credits', 'view_financial_ledger', 'manage_lower_users',
    'assign_manager_roles', 'view_company_analytics'
  ],

  // MEDIUM-HIGH AUTHORITY - Manager (Level 6)
  'Manager': [
    'manage_properties', 'manage_tenants', 'manage_leases',
    'view_reports', 'send_communications', 'manage_maintenance',
    'manage_finances', 'manage_documents', 'add_credits',
    'view_financial_ledger', 'manage_staff', 'assign_property_manager_roles'
  ],

  // MEDIUM AUTHORITY - Property Manager (Level 4)
  'Property Manager': [
    'manage_properties', 'manage_tenants', 'manage_leases',
    'view_reports', 'send_communications', 'manage_maintenance',
    'manage_finances', 'manage_documents', 'add_credits',
    'view_financial_ledger'
  ],

  // STANDARD AUTHORITY - User (Level 2)
  'User': [
    'view_properties', 'view_tenants', 'view_reports',
    'send_communications', 'view_maintenance', 'view_documents'
  ],

  // LIMITED AUTHORITY - Tenant (Level 1)
  'Tenant': [
    'view_profile', 'view_lease', 'pay_rent',
    'submit_maintenance', 'view_communications'
  ],

  // EXTERNAL ACCESS - Service Provider (Level 1)
  'Service Provider': [
    'view_work_orders', 'update_work_status',
    'submit_invoices', 'view_communications'
  ],
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load users and current user from localStorage on app start
  useEffect(() => {
    // Load users list
    const savedUsers = localStorage.getItem('users');
    let usersList = mockUsers;
    if (savedUsers) {
      try {
        usersList = JSON.parse(savedUsers);
      } catch (error) {
        // Invalid JSON, use mock users
        usersList = mockUsers;
      }
    } else {
      // First time, save mock users to localStorage
      localStorage.setItem('users', JSON.stringify(mockUsers));
    }

    // Ensure all users have name property and timezone defaults
    usersList = usersList.map(user => ({
      ...user,
      name: user.name || `${user.firstName} ${user.lastName}`,
      timezone: user.timezone || 'UTC',
      preferredLanguage: user.preferredLanguage || 'en',
      countryCode: user.countryCode || 'US'
    }));

    setUsers(usersList);

    // Load current user
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // Verify user still exists in our user list
        const foundUser = usersList.find(u => u.id === userData.id);
        if (foundUser) {
          setUser(foundUser);
          setIsAuthenticated(true);
        } else {
          // User not found, clear storage
          localStorage.removeItem('currentUser');
        }
      } catch (error) {
        // Invalid JSON, clear storage
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    // Simulate API call
    const foundUser = users.find(u => u.email === email && u.status === 'Active');

    if (foundUser) {
      // In demo/development mode, allow demo password
      const isDemoMode = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_LOGIN === 'true' || true; // Temporarily enabled for Vercel access
      const isValidPassword = isDemoMode ? (password === 'demo123') : false; // In production, implement real password validation here

      if (!isDemoMode) {
        // TODO: Implement real password validation for production
        // Example: const isValidPassword = await bcrypt.compare(password, foundUser.hashedPassword);
        return { success: false, message: 'Password validation not implemented for production. Please contact administrator.' };
      }

      if (isValidPassword) {
        const updatedUser = { ...foundUser, lastLogin: new Date().toISOString() };
        setUser(updatedUser);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));

        // Update user in the list
        setUsers(prev => prev.map(u => u.id === foundUser.id ? updatedUser : u));

        return { success: true, message: 'Login successful' };
      } else {
        return { success: false, message: 'Invalid password' };
      }
    } else {
      return { success: false, message: 'Invalid credentials or inactive account' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  const switchUser = (userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
    }
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>): User => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      name: userData.name || `${userData.firstName} ${userData.lastName}`,
      createdAt: new Date().toISOString(),
      permissions: rolePermissions[userData.role] || [],
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    return newUser;
  };

  const updateUser = (userId: string, userData: Partial<User>) => {
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        const updated = { ...u, ...userData, permissions: userData.role ? rolePermissions[userData.role] : u.permissions };
        // Recompute name if firstName or lastName changed
        if (userData.firstName || userData.lastName) {
          updated.name = `${updated.firstName} ${updated.lastName}`;
        }
        return updated;
      }
      return u;
    });
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // Update current user if it's the same user
    if (user && user.id === userId) {
      const updatedUser = { ...user, ...userData };
      if (userData.firstName || userData.lastName) {
        updatedUser.name = `${updatedUser.firstName} ${updatedUser.lastName}`;
      }
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const deleteUser = (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // Logout if deleting current user
    if (user && user.id === userId) {
      logout();
    }
  };

  const getUsersByRole = (role: UserRole): User[] => {
    return users.filter(u => u.role === role);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.permissions.includes('all')) return true;
    return user.permissions.includes(permission);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    const foundUser = users.find(u => u.email === email && u.status === 'Active');

    if (foundUser) {
      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8);

      // In a real app, you'd update the user's password in the database
      // For demo purposes, we'll just trigger the email
      await sendPasswordEmail(email, tempPassword);

      return {
        success: true,
        message: 'Password reset email sent. Check your email for the temporary password.'
      };
    } else {
      return {
        success: false,
        message: 'Email not found or account is inactive.'
      };
    }
  };

  const sendPasswordEmail = async (email: string, tempPassword: string) => {
    try {
      // Get the active email accounts
      const emailAccounts = EmailService.getAccounts().filter(account =>
        account.isActive && account.status === 'connected'
      );

      if (emailAccounts.length === 0) {
        // Fallback to mailto if no email accounts configured
        console.warn('No email accounts configured, falling back to mailto');
        const subject = encodeURIComponent('PropCRM - Password Reset');
        const body = encodeURIComponent(`Your temporary password is: ${tempPassword}\n\nPlease log in and change your password immediately.\n\nIf you did not request this password reset, please contact support.`);
        const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
        window.open(mailtoLink, '_blank');
        return;
      }

      // Use the first available email account
      const primaryAccount = emailAccounts[0];

      // Get the password reset template
      const templates = EmailService.getTemplates();
      const passwordResetTemplate = templates.find(t =>
        t.name === 'Password Reset' && t.isActive
      );

      if (passwordResetTemplate) {
        // Send using template
        await EmailService.sendEmail({
          from: primaryAccount.email,
          to: [email],
          subject: passwordResetTemplate.subject,
          htmlBody: passwordResetTemplate.htmlBody,
          textBody: passwordResetTemplate.textBody,
          templateId: passwordResetTemplate.id,
          variables: {
            userName: email.split('@')[0], // Simple username extraction
            tempPassword: tempPassword,
            appName: 'PropCRM'
          },
          providerId: primaryAccount.providerId,
          accountId: primaryAccount.id
        });
      } else {
        // Send without template
        await EmailService.sendEmail({
          from: primaryAccount.email,
          to: [email],
          subject: 'PropCRM - Password Reset',
          htmlBody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Password Reset Request</h2>
              <p>Hello,</p>
              <p>You have requested to reset your password. Your temporary password is:</p>
              <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; font-family: monospace; font-size: 18px; font-weight: bold; text-align: center;">
                ${tempPassword}
              </div>
              <p>Please log in using this temporary password and change it immediately for security reasons.</p>
              <p>If you did not request this password reset, please contact our support team.</p>
              <p>Best regards,<br>PropCRM Team</p>
            </div>
          `,
          textBody: `Hello,

You have requested to reset your password. Your temporary password is: ${tempPassword}

Please log in using this temporary password and change it immediately for security reasons.

If you did not request this password reset, please contact our support team.

Best regards,
PropCRM Team`,
          providerId: primaryAccount.providerId,
          accountId: primaryAccount.id
        });
      }

      console.log('Password reset email sent successfully via EmailService');
    } catch (error) {
      console.error('Failed to send password reset email:', error);

      // Fallback to mailto on error
      const subject = encodeURIComponent('PropCRM - Password Reset');
      const body = encodeURIComponent(`Your temporary password is: ${tempPassword}\n\nPlease log in and change your password immediately.\n\nIf you did not request this password reset, please contact support.`);
      const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
      window.open(mailtoLink, '_blank');
    }
  };

  const value: AuthContextType = {
    user,
    users,
    login,
    logout,
    switchUser,
    addUser,
    updateUser,
    deleteUser,
    getUsersByRole,
    resetPassword,
    sendPasswordEmail,
    isAuthenticated,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
