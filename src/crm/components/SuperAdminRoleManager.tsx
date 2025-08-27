import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Stack,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Tooltip,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormGroup,
  Menu,
  MenuList,
  ClickAwayListener,
  Popper,
  Grow,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  VpnKey as VpnKeyIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  ExpandMore as ExpandMoreIcon,
  ContentCopy as ContentCopyIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { accessControlService } from '../services/AccessControlService';
import { userManagementService, User as UserMgmtUser, UserAction } from '../services/UserManagementService';
import { uniformTooltipStyles } from '../utils/formStyles';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`role-manager-tabpanel-${index}`}
      aria-labelledby={`role-manager-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface Role {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'custom';
  permissions: Permission[];
  hierarchy: number;
  inheritsFrom?: string[];
  isActive: boolean;
  userCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface Permission {
  id: string;
  resource: string;
  action: string;
  scope: 'all' | 'own' | 'team' | 'assigned' | 'custom';
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

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  roles: string[];
  lastLogin?: string;
  createdAt: string;
  metadata: {
    department?: string;
    jobTitle?: string;
    phoneNumber?: string;
    timezone?: string;
    language?: string;
    twoFactorEnabled: boolean;
  };
}

const defaultPermissions: Permission[] = [
  // Properties
  { id: 'properties_view', resource: 'properties', action: 'read', scope: 'all', metadata: { description: 'View all properties', category: 'Properties', riskLevel: 'low' } },
  { id: 'properties_create', resource: 'properties', action: 'create', scope: 'all', metadata: { description: 'Create new properties', category: 'Properties', riskLevel: 'medium' } },
  { id: 'properties_edit', resource: 'properties', action: 'update', scope: 'all', metadata: { description: 'Edit existing properties', category: 'Properties', riskLevel: 'medium' } },
  { id: 'properties_delete', resource: 'properties', action: 'delete', scope: 'all', metadata: { description: 'Delete properties', category: 'Properties', riskLevel: 'high' } },
  { id: 'properties_manage', resource: 'properties', action: 'manage', scope: 'all', metadata: { description: 'Full property management', category: 'Properties', riskLevel: 'high' } },

  // Tenants
  { id: 'tenants_view', resource: 'tenants', action: 'read', scope: 'all', metadata: { description: 'View tenant information', category: 'Tenants', riskLevel: 'low' } },
  { id: 'tenants_create', resource: 'tenants', action: 'create', scope: 'all', metadata: { description: 'Add new tenants', category: 'Tenants', riskLevel: 'medium' } },
  { id: 'tenants_edit', resource: 'tenants', action: 'update', scope: 'all', metadata: { description: 'Edit tenant information', category: 'Tenants', riskLevel: 'medium' } },
  { id: 'tenants_delete', resource: 'tenants', action: 'delete', scope: 'all', metadata: { description: 'Remove tenants', category: 'Tenants', riskLevel: 'high' } },

  // Users and Roles
  { id: 'users_view', resource: 'users', action: 'read', scope: 'all', metadata: { description: 'View user accounts', category: 'User Management', riskLevel: 'medium' } },
  { id: 'users_create', resource: 'users', action: 'create', scope: 'all', metadata: { description: 'Create new users', category: 'User Management', riskLevel: 'high' } },
  { id: 'users_edit', resource: 'users', action: 'update', scope: 'all', metadata: { description: 'Edit user accounts', category: 'User Management', riskLevel: 'high' } },
  { id: 'users_delete', resource: 'users', action: 'delete', scope: 'all', metadata: { description: 'Delete user accounts', category: 'User Management', riskLevel: 'critical' } },
  { id: 'users_activate', resource: 'users', action: 'activate', scope: 'all', metadata: { description: 'Activate user accounts', category: 'User Management', riskLevel: 'medium' } },
  { id: 'users_deactivate', resource: 'users', action: 'deactivate', scope: 'all', metadata: { description: 'Deactivate user accounts', category: 'User Management', riskLevel: 'high' } },
  { id: 'roles_view', resource: 'roles', action: 'read', scope: 'all', metadata: { description: 'View roles and permissions', category: 'User Management', riskLevel: 'medium' } },
  { id: 'roles_create', resource: 'roles', action: 'create', scope: 'all', metadata: { description: 'Create new roles', category: 'User Management', riskLevel: 'high' } },
  { id: 'roles_edit', resource: 'roles', action: 'update', scope: 'all', metadata: { description: 'Edit existing roles', category: 'User Management', riskLevel: 'high' } },
  { id: 'roles_delete', resource: 'roles', action: 'delete', scope: 'all', metadata: { description: 'Delete roles', category: 'User Management', riskLevel: 'critical' } },
  { id: 'roles_assign', resource: 'roles', action: 'assign', scope: 'all', metadata: { description: 'Assign roles to users', category: 'User Management', riskLevel: 'high' } },

  // Communications
  { id: 'communications_view', resource: 'communications', action: 'read', scope: 'all', metadata: { description: 'View communications', category: 'Communications', riskLevel: 'low' } },
  { id: 'communications_send', resource: 'communications', action: 'create', scope: 'all', metadata: { description: 'Send communications', category: 'Communications', riskLevel: 'medium' } },
  { id: 'communications_manage', resource: 'communications', action: 'manage', scope: 'all', metadata: { description: 'Full communication management', category: 'Communications', riskLevel: 'medium' } },

  // Work Orders
  { id: 'workorders_view', resource: 'workorders', action: 'read', scope: 'all', metadata: { description: 'View work orders', category: 'Work Orders', riskLevel: 'low' } },
  { id: 'workorders_create', resource: 'workorders', action: 'create', scope: 'all', metadata: { description: 'Create work orders', category: 'Work Orders', riskLevel: 'medium' } },
  { id: 'workorders_assign', resource: 'workorders', action: 'assign', scope: 'all', metadata: { description: 'Assign work orders', category: 'Work Orders', riskLevel: 'medium' } },
  { id: 'workorders_manage', resource: 'workorders', action: 'manage', scope: 'all', metadata: { description: 'Full work order management', category: 'Work Orders', riskLevel: 'medium' } },

  // Reports and Analytics
  { id: 'reports_view', resource: 'reports', action: 'read', scope: 'all', metadata: { description: 'View reports', category: 'Reports', riskLevel: 'low' } },
  { id: 'reports_create', resource: 'reports', action: 'create', scope: 'all', metadata: { description: 'Create custom reports', category: 'Reports', riskLevel: 'medium' } },
  { id: 'analytics_view', resource: 'analytics', action: 'read', scope: 'all', metadata: { description: 'View analytics data', category: 'Reports', riskLevel: 'medium' } },

  // System Settings
  { id: 'settings_view', resource: 'settings', action: 'read', scope: 'all', metadata: { description: 'View system settings', category: 'System', riskLevel: 'medium' } },
  { id: 'settings_edit', resource: 'settings', action: 'update', scope: 'all', metadata: { description: 'Edit system settings', category: 'System', riskLevel: 'critical' } },
  { id: 'system_backup', resource: 'system', action: 'backup', scope: 'all', metadata: { description: 'Create system backups', category: 'System', riskLevel: 'high' } },
  { id: 'system_restore', resource: 'system', action: 'restore', scope: 'all', metadata: { description: 'Restore from backups', category: 'System', riskLevel: 'critical' } },

  // Financial
  { id: 'financials_view', resource: 'financials', action: 'read', scope: 'all', metadata: { description: 'View financial data', category: 'Financial', riskLevel: 'medium' } },
  { id: 'financials_edit', resource: 'financials', action: 'update', scope: 'all', metadata: { description: 'Edit financial records', category: 'Financial', riskLevel: 'high' } },
  { id: 'payments_process', resource: 'payments', action: 'process', scope: 'all', metadata: { description: 'Process payments', category: 'Financial', riskLevel: 'high' } },
];

export default function SuperAdminRoleManager() {
  const [currentTab, setCurrentTab] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  // Data states
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  // Dialog states
  const [roleDialogOpen, setRoleDialogOpen] = React.useState(false);
  const [userDialogOpen, setUserDialogOpen] = React.useState(false);
  const [assignRoleDialogOpen, setAssignRoleDialogOpen] = React.useState(false);
  const [bulkActionsOpen, setBulkActionsOpen] = React.useState(false);

  // Form states
  const [roleForm, setRoleForm] = React.useState({
    name: '',
    description: '',
    permissions: [] as string[],
    hierarchy: 1,
    inheritsFrom: [] as string[]
  });

  const [userForm, setUserForm] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    department: '',
    jobTitle: '',
    phoneNumber: '',
    timezone: 'UTC',
    language: 'en'
  });

  // Filter states
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([]);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load roles from AccessControlService
      const mockRoles: Role[] = [
        {
          id: 'super_admin',
          name: 'Super Administrator',
          description: 'Full system access with all permissions',
          type: 'system',
          permissions: defaultPermissions,
          hierarchy: 10,
          isActive: true,
          userCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system'
        },
        {
          id: 'admin',
          name: 'Administrator',
          description: 'High level access to manage company operations',
          type: 'system',
          permissions: defaultPermissions.filter(p => !['system_restore', 'settings_edit'].includes(p.id)),
          hierarchy: 8,
          isActive: true,
          userCount: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system'
        },
        {
          id: 'property_manager',
          name: 'Property Manager',
          description: 'Manage properties, tenants, and maintenance',
          type: 'system',
          permissions: defaultPermissions.filter(p =>
            ['properties', 'tenants', 'workorders', 'communications', 'reports'].some(resource =>
              p.resource === resource
            )
          ),
          hierarchy: 4,
          isActive: true,
          userCount: 8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system'
        },
        {
          id: 'tenant',
          name: 'Tenant',
          description: 'Basic tenant access to own information',
          type: 'system',
          permissions: defaultPermissions.filter(p =>
            p.scope === 'own' || ['workorders_create', 'communications_view'].includes(p.id)
          ),
          hierarchy: 1,
          isActive: true,
          userCount: 45,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system'
        }
      ];

      // Load users from UserManagementService
      const userMgmtUsers = userManagementService.getUsers();
      const convertedUsers: User[] = userMgmtUsers.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
        roles: [user.role], // Convert single role to array for consistency
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        metadata: user.metadata
      }));

      setRoles(mockRoles);
      setUsers(convertedUsers);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setRoleForm({
      name: '',
      description: '',
      permissions: [],
      hierarchy: 1,
      inheritsFrom: []
    });
    setRoleDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setRoleForm({
      name: role.name,
      description: role.description,
      permissions: role.permissions.map(p => p.id),
      hierarchy: role.hierarchy,
      inheritsFrom: role.inheritsFrom || []
    });
    setRoleDialogOpen(true);
  };

  const handleSaveRole = async () => {
    try {
      if (selectedRole) {
        // Update existing role
        const updatedRole: Role = {
          ...selectedRole,
          name: roleForm.name,
          description: roleForm.description,
          permissions: defaultPermissions.filter(p => roleForm.permissions.includes(p.id)),
          hierarchy: roleForm.hierarchy,
          inheritsFrom: roleForm.inheritsFrom,
          updatedAt: new Date().toISOString()
        };

        setRoles(prev => prev.map(r => r.id === selectedRole.id ? updatedRole : r));
      } else {
        // Create new role
        const newRole: Role = {
          id: `role_${Date.now()}`,
          name: roleForm.name,
          description: roleForm.description,
          type: 'custom',
          permissions: defaultPermissions.filter(p => roleForm.permissions.includes(p.id)),
          hierarchy: roleForm.hierarchy,
          inheritsFrom: roleForm.inheritsFrom,
          isActive: true,
          userCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'super_admin'
        };

        setRoles(prev => [...prev, newRole]);
      }

      setRoleDialogOpen(false);
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;

    if (role.type === 'system') {
      alert('System roles cannot be deleted');
      return;
    }

    if (role.userCount > 0) {
      alert('Cannot delete role that has assigned users. Please reassign users first.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      setRoles(prev => prev.filter(r => r.id !== roleId));
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setUserForm({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      department: '',
      jobTitle: '',
      phoneNumber: '',
      timezone: 'UTC',
      language: 'en'
    });
    setUserDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      department: user.metadata.department || '',
      jobTitle: user.metadata.jobTitle || '',
      phoneNumber: user.metadata.phoneNumber || '',
      timezone: user.metadata.timezone || 'UTC',
      language: user.metadata.language || 'en'
    });
    setUserDialogOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      if (selectedUser) {
        // Update existing user
        const updatedUser: User = {
          ...selectedUser,
          firstName: userForm.firstName,
          lastName: userForm.lastName,
          email: userForm.email,
          metadata: {
            ...selectedUser.metadata,
            department: userForm.department,
            jobTitle: userForm.jobTitle,
            phoneNumber: userForm.phoneNumber,
            timezone: userForm.timezone,
            language: userForm.language
          }
        };

        setUsers(prev => prev.map(u => u.id === selectedUser.id ? updatedUser : u));
      } else {
        // Create new user
        const newUser: User = {
          id: `user_${Date.now()}`,
          firstName: userForm.firstName,
          lastName: userForm.lastName,
          email: userForm.email,
          status: 'active',
          roles: [],
          createdAt: new Date().toISOString(),
          metadata: {
            department: userForm.department,
            jobTitle: userForm.jobTitle,
            phoneNumber: userForm.phoneNumber,
            timezone: userForm.timezone,
            language: userForm.language,
            twoFactorEnabled: false
          }
        };

        setUsers(prev => [...prev, newUser]);
      }

      setUserDialogOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleUserStatusChange = async (userId: string, newStatus: User['status'], reason?: string) => {
    try {
      const currentUser = users.find(u => u.id === userId);
      if (!currentUser) return;

      switch (newStatus) {
        case 'active':
          if (currentUser.status === 'inactive') {
            await userManagementService.activateUser(userId, 'super_admin_001', reason);
          } else if (currentUser.status === 'suspended') {
            await userManagementService.unsuspendUser(userId, 'super_admin_001', reason);
          } else if (currentUser.status === 'locked') {
            await userManagementService.unlockUser(userId, 'super_admin_001', reason);
          }
          break;
        case 'inactive':
          await userManagementService.deactivateUser(userId, 'super_admin_001', reason);
          break;
        case 'suspended':
          await userManagementService.suspendUser(userId, 'super_admin_001', reason || 'Suspended by Super Admin');
          break;
        case 'locked':
          await userManagementService.lockUser(userId, 'super_admin_001', reason || 'Account locked for security');
          break;
      }

      // Reload data to reflect changes
      await loadData();
    } catch (error) {
      console.error('Error changing user status:', error);
      alert(error instanceof Error ? error.message : 'Failed to change user status');
    }
  };

  const handleAssignRole = (userId: string, roleId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId 
        ? { ...u, roles: u.roles.includes(roleId) ? u.roles : [...u.roles, roleId] }
        : u
    ));

    // Update role user count
    setRoles(prev => prev.map(r => 
      r.id === roleId 
        ? { ...r, userCount: r.userCount + 1 }
        : r
    ));
  };

  const handleRemoveRole = (userId: string, roleId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId 
        ? { ...u, roles: u.roles.filter(r => r !== roleId) }
        : u
    ));

    // Update role user count
    setRoles(prev => prev.map(r => 
      r.id === roleId 
        ? { ...r, userCount: Math.max(0, r.userCount - 1) }
        : r
    ));
  };

  const handlePermissionToggle = (permissionId: string) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'pending': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const getRiskColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getHierarchyLabel = (hierarchy: number) => {
    if (hierarchy >= 8) return 'High Authority';
    if (hierarchy >= 4) return 'Medium Authority';
    if (hierarchy >= 2) return 'Standard Authority';
    return 'Basic Authority';
  };

  const getPermissionsByCategory = () => {
    const categories = [...new Set(defaultPermissions.map(p => p.metadata?.category || 'Other'))];
    return categories.map(category => ({
      category,
      permissions: defaultPermissions.filter(p => p.metadata?.category === category)
    }));
  };

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || role.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && role.isActive) ||
                         (statusFilter === 'inactive' && !role.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" component="h2">
          Role & User Management
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleCreateUser}
          >
            Add User
          </Button>
          <Button
            variant="contained"
            startIcon={<SecurityIcon />}
            onClick={handleCreateRole}
          >
            Create Role
          </Button>
        </Stack>
      </Stack>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <SecurityIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Total Roles</Typography>
                  <Typography variant="h4">{roles.length}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <GroupIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Custom Roles</Typography>
                  <Typography variant="h4">{roles.filter(r => r.type === 'custom').length}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Total Users</Typography>
                  <Typography variant="h4">{users.length}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">Active Users</Typography>
                  <Typography variant="h4">{users.filter(u => u.status === 'active').length}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search roles and users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="system">System</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<FilterListIcon />}
            sx={{ height: '56px' }}
          >
            More Filters
          </Button>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab
            icon={<SecurityIcon />}
            label={`Roles (${filteredRoles.length})`}
            iconPosition="start"
          />
          <Tab
            icon={<PersonIcon />}
            label={`Users (${filteredUsers.length})`}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Roles Tab */}
      <TabPanel value={currentTab} index={0}>
        <Grid container spacing={2}>
          {filteredRoles.map((role) => (
            <Grid item xs={12} md={6} lg={4} key={role.id}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="h6">{role.name}</Typography>
                          {role.type === 'system' && (
                            <Chip label="SYSTEM" size="small" color="error" />
                          )}
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {role.description}
                        </Typography>
                      </Box>
                      <IconButton size="small">
                        <MoreVertIcon />
                      </IconButton>
                    </Stack>

                    <Divider />

                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="h5" color="primary.main">
                            {role.userCount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Users
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="h5" color="info.main">
                            {role.permissions.length}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Permissions
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box textAlign="center">
                          <Typography variant="h5" color="warning.main">
                            {role.hierarchy}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Level
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Stack spacing={1}>
                      <Typography variant="caption" color="text.secondary">
                        Authority: {getHierarchyLabel(role.hierarchy)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Updated: {new Date(role.updatedAt).toLocaleDateString()}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="View Permissions" sx={uniformTooltipStyles}>
                        <IconButton 
                          size="small"
                          onClick={() => {
                            setSelectedRole(role);
                            // Could open a permission viewer dialog
                          }}
                        >
                          <VpnKeyIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Role" sx={uniformTooltipStyles}>
                        <IconButton 
                          size="small"
                          onClick={() => handleEditRole(role)}
                          disabled={role.type === 'system'}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Role" sx={uniformTooltipStyles}>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteRole(role.id)}
                          disabled={role.type === 'system' || role.userCount > 0}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Users Tab */}
      <TabPanel value={currentTab} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar>
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {user.firstName} {user.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                        {user.metadata.twoFactorEnabled && (
                          <Chip 
                            label="2FA" 
                            size="small" 
                            color="success" 
                            sx={{ ml: 1, height: '18px', fontSize: '10px' }}
                          />
                        )}
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                      {user.roles.map((roleId) => {
                        const role = roles.find(r => r.id === roleId);
                        return role ? (
                          <Chip 
                            key={roleId}
                            label={role.name} 
                            size="small" 
                            color={role.type === 'system' ? 'primary' : 'secondary'}
                            variant="outlined"
                          />
                        ) : null;
                      })}
                      {user.roles.length === 0 && (
                        <Chip label="No roles" size="small" color="default" />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.status} 
                      size="small" 
                      color={getStatusColor(user.status) as any}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.metadata.department || 'Not specified'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.metadata.jobTitle || 'No job title'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Edit User" sx={uniformTooltipStyles}>
                        <IconButton size="small" onClick={() => handleEditUser(user)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Assign Roles" sx={uniformTooltipStyles}>
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            setSelectedUser(user);
                            setAssignRoleDialogOpen(true);
                          }}
                        >
                          <AssignmentIcon />
                        </IconButton>
                      </Tooltip>
                      {user.status === 'active' ? (
                        <Tooltip title="Deactivate User" sx={uniformTooltipStyles}>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleUserStatusChange(user.id, 'inactive')}
                          >
                            <LockIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Activate User" sx={uniformTooltipStyles}>
                          <IconButton 
                            size="small" 
                            color="success"
                            onClick={() => handleUserStatusChange(user.id, 'active')}
                          >
                            <LockOpenIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Create/Edit Role Dialog */}
      <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedRole ? 'Edit Role' : 'Create New Role'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Role Name"
                  fullWidth
                  required
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Hierarchy Level"
                  type="number"
                  fullWidth
                  required
                  value={roleForm.hierarchy}
                  onChange={(e) => setRoleForm({ ...roleForm, hierarchy: parseInt(e.target.value) })}
                  inputProps={{ min: 1, max: 10 }}
                  helperText="Higher numbers indicate more authority (1-10)"
                />
              </Grid>
            </Grid>

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={roleForm.description}
              onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
            />

            <Typography variant="h6">Permissions</Typography>
            
            {getPermissionsByCategory().map(({ category, permissions }) => (
              <Accordion key={category}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography variant="subtitle1">{category}</Typography>
                    <Chip 
                      label={`${roleForm.permissions.filter(p => 
                        permissions.some(perm => perm.id === p)
                      ).length}/${permissions.length}`}
                      size="small"
                      color="primary"
                    />
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <FormGroup>
                    {permissions.map((permission) => (
                      <FormControlLabel
                        key={permission.id}
                        control={
                          <Checkbox
                            checked={roleForm.permissions.includes(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                          />
                        }
                        label={
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Box>
                              <Typography variant="body2">{permission.id}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {permission.metadata?.description}
                              </Typography>
                            </Box>
                            {permission.metadata?.riskLevel && (
                              <Chip 
                                label={permission.metadata.riskLevel.toUpperCase()} 
                                size="small" 
                                color={getRiskColor(permission.metadata.riskLevel) as any}
                              />
                            )}
                          </Stack>
                        }
                      />
                    ))}
                  </FormGroup>
                </AccordionDetails>
              </Accordion>
            ))}

            <Alert severity="info">
              Selected permissions: {roleForm.permissions.length} out of {defaultPermissions.length}
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveRole}>
            {selectedRole ? 'Update' : 'Create'} Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit User Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="First Name"
                  fullWidth
                  required
                  value={userForm.firstName}
                  onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Last Name"
                  fullWidth
                  required
                  value={userForm.lastName}
                  onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                />
              </Grid>
            </Grid>

            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            />

            {!selectedUser && (
              <TextField
                label="Initial Password"
                type="password"
                fullWidth
                required
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                helperText="User will be prompted to change password on first login"
              />
            )}

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Department"
                  fullWidth
                  value={userForm.department}
                  onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Job Title"
                  fullWidth
                  value={userForm.jobTitle}
                  onChange={(e) => setUserForm({ ...userForm, jobTitle: e.target.value })}
                />
              </Grid>
            </Grid>

            <TextField
              label="Phone Number"
              fullWidth
              value={userForm.phoneNumber}
              onChange={(e) => setUserForm({ ...userForm, phoneNumber: e.target.value })}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={userForm.timezone}
                    label="Timezone"
                    onChange={(e) => setUserForm({ ...userForm, timezone: e.target.value })}
                  >
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="America/New_York">Eastern Time</MenuItem>
                    <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                    <MenuItem value="America/Chicago">Central Time</MenuItem>
                    <MenuItem value="America/Denver">Mountain Time</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={userForm.language}
                    label="Language"
                    onChange={(e) => setUserForm({ ...userForm, language: e.target.value })}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                    <MenuItem value="de">German</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveUser}>
            {selectedUser ? 'Update' : 'Create'} User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Role Dialog */}
      <Dialog open={assignRoleDialogOpen} onClose={() => setAssignRoleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Assign Roles to {selectedUser?.firstName} {selectedUser?.lastName}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Alert severity="info">
              Select roles to assign to this user. Users can have multiple roles.
            </Alert>
            
            <Typography variant="subtitle2">Current Roles:</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {selectedUser?.roles.map((roleId) => {
                const role = roles.find(r => r.id === roleId);
                return role ? (
                  <Chip 
                    key={roleId}
                    label={role.name}
                    onDelete={() => handleRemoveRole(selectedUser.id, roleId)}
                    color="primary"
                  />
                ) : null;
              })}
              {selectedUser?.roles.length === 0 && (
                <Typography variant="body2" color="text.secondary">No roles assigned</Typography>
              )}
            </Stack>

            <Typography variant="subtitle2">Available Roles:</Typography>
            <FormGroup>
              {roles.filter(role => !selectedUser?.roles.includes(role.id)).map((role) => (
                <FormControlLabel
                  key={role.id}
                  control={
                    <Checkbox
                      onChange={(e) => {
                        if (e.target.checked && selectedUser) {
                          handleAssignRole(selectedUser.id, role.id);
                        }
                      }}
                    />
                  }
                  label={
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box>
                        <Typography variant="body2">{role.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {role.description}
                        </Typography>
                      </Box>
                      <Chip 
                        label={getHierarchyLabel(role.hierarchy)} 
                        size="small" 
                        color={role.type === 'system' ? 'primary' : 'secondary'}
                      />
                    </Stack>
                  }
                />
              ))}
            </FormGroup>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignRoleDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
