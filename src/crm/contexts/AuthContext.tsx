import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'Admin' | 'Property Manager' | 'Tenant' | 'Service Provider';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
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
    id: '1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@propcrm.com',
    role: 'Admin',
    status: 'Active',
    permissions: ['all'],
    createdAt: '2024-01-01T00:00:00Z',
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
  },
  {
    id: '3',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@propcrm.com',
    phone: '(555) 111-2222',
    role: 'Property Manager',
    status: 'Active',
    permissions: ['manage_properties', 'manage_tenants', 'view_reports', 'send_communications'],
    properties: ['Sunset Apartments', 'Ocean View Villa'],
    createdAt: '2024-01-03T00:00:00Z',
  },
  {
    id: '4',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    role: 'Tenant',
    status: 'Active',
    permissions: ['view_profile', 'view_lease', 'pay_rent', 'submit_maintenance'],
    properties: ['Sunset Apartments'],
    createdAt: '2024-01-04T00:00:00Z',
  },
  {
    id: '5',
    firstName: 'Mike',
    lastName: 'Wilson',
    email: 'mike@handyservices.com',
    phone: '(555) 333-4444',
    role: 'Service Provider',
    status: 'Active',
    permissions: ['view_work_orders', 'update_work_status', 'submit_invoices'],
    serviceType: 'Plumbing',
    createdAt: '2024-01-05T00:00:00Z',
  },
];

const rolePermissions: Record<UserRole, string[]> = {
  'Admin': ['all'],
  'Property Manager': [
    'manage_properties',
    'manage_tenants',
    'manage_leases',
    'view_reports',
    'send_communications',
    'manage_maintenance',
    'manage_finances',
    'manage_documents',
    'delete_charges',
    'add_credits',
    'view_financial_ledger',
  ],
  'Tenant': [
    'view_profile',
    'view_lease',
    'pay_rent',
    'submit_maintenance',
    'view_communications',
  ],
  'Service Provider': [
    'view_work_orders',
    'update_work_status',
    'submit_invoices',
    'view_communications',
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
      const updatedUser = { ...foundUser, lastLogin: new Date().toISOString() };
      setUser(updatedUser);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Update user in the list
      setUsers(prev => prev.map(u => u.id === foundUser.id ? updatedUser : u));
      
      return { success: true, message: 'Login successful' };
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
      createdAt: new Date().toISOString(),
      permissions: rolePermissions[userData.role] || [],
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    return newUser;
  };

  const updateUser = (userId: string, userData: Partial<User>) => {
    const updatedUsers = users.map(u =>
      u.id === userId
        ? { ...u, ...userData, permissions: userData.role ? rolePermissions[userData.role] : u.permissions }
        : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // Update current user if it's the same user
    if (user && user.id === userId) {
      const updatedUser = { ...user, ...userData };
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
      sendPasswordEmail(email, tempPassword);

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

  const sendPasswordEmail = (email: string, tempPassword: string) => {
    const subject = encodeURIComponent('PropCRM - Password Reset');
    const body = encodeURIComponent(`Your temporary password is: ${tempPassword}\n\nPlease log in and change your password immediately.\n\nIf you did not request this password reset, please contact support.`);

    // Create mailto link that will open user's default email client
    const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;

    // Open the default email client
    window.open(mailtoLink, '_blank');
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
