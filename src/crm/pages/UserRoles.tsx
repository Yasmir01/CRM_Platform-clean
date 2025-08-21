import * as React from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
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
  FormHelperText,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import { useCrmData } from "../contexts/CrmDataContext";
import { useAuth, UserRole } from "../contexts/AuthContext";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: "Properties" | "Tenants" | "Managers" | "Reports" | "Settings" | "Work Orders" | "Marketing" | "Financial";
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  userCount: number;
  hierarchy: number; // Authority level (higher = more authority)
  createdDate: string;
  updatedDate: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  status: "Active" | "Inactive" | "Pending";
  lastLogin?: string;
  profilePicture?: string;
  linkedPropertyId?: string; // For tenant users
  preferredLanguage?: string;
  timezone?: string;
  countryCode?: string;
}

const allPermissions: Permission[] = [
  // Properties
  { id: "prop_view", name: "View Properties", description: "View property listings and details", category: "Properties" },
  { id: "prop_create", name: "Create Properties", description: "Add new properties to the system", category: "Properties" },
  { id: "prop_edit", name: "Edit Properties", description: "Modify property information", category: "Properties" },
  { id: "prop_delete", name: "Delete Properties", description: "Remove properties from the system", category: "Properties" },
  { id: "prop_pictures", name: "Manage Property Pictures", description: "Upload and manage property images", category: "Properties" },
  
  // Tenants
  { id: "tenant_view", name: "View Tenants", description: "View tenant information and details", category: "Tenants" },
  { id: "tenant_create", name: "Create Tenants", description: "Add new tenants to the system", category: "Tenants" },
  { id: "tenant_edit", name: "Edit Tenants", description: "Modify tenant information", category: "Tenants" },
  { id: "tenant_delete", name: "Delete Tenants", description: "Remove tenants from the system", category: "Tenants" },
  { id: "tenant_payments", name: "Manage Tenant Payments", description: "Process payments and financial transactions", category: "Tenants" },
  { id: "tenant_own_view", name: "View Own Property Data", description: "View data only for linked property (Tenant role)", category: "Tenants" },
  { id: "tenant_own_wo", name: "Create Work Orders for Own Property", description: "Submit work orders for own property", category: "Tenants" },
  { id: "tenant_own_communication", name: "View Own Communications", description: "View messages and notices for own property", category: "Tenants" },
  
  // Managers
  { id: "manager_view", name: "View Managers", description: "View property manager information", category: "Managers" },
  { id: "manager_create", name: "Create Managers", description: "Add new property managers", category: "Managers" },
  { id: "manager_edit", name: "Edit Managers", description: "Modify manager information", category: "Managers" },
  { id: "manager_delete", name: "Delete Managers", description: "Remove managers from the system", category: "Managers" },
  
  // Work Orders
  { id: "wo_view", name: "View Work Orders", description: "View work orders and maintenance requests", category: "Work Orders" },
  { id: "wo_create", name: "Create Work Orders", description: "Create new work orders", category: "Work Orders" },
  { id: "wo_assign", name: "Assign Work Orders", description: "Assign work orders to vendors", category: "Work Orders" },
  { id: "wo_edit", name: "Edit Work Orders", description: "Modify work order details", category: "Work Orders" },
  { id: "wo_delete", name: "Delete Work Orders", description: "Remove work orders", category: "Work Orders" },
  
  // Marketing
  { id: "marketing_view", name: "View Marketing", description: "View marketing campaigns and templates", category: "Marketing" },
  { id: "marketing_create", name: "Create Marketing", description: "Create email and SMS campaigns", category: "Marketing" },
  { id: "marketing_send", name: "Send Marketing", description: "Send marketing campaigns", category: "Marketing" },
  { id: "marketing_templates", name: "Manage Templates", description: "Create and edit marketing templates", category: "Marketing" },
  
  // Reports
  { id: "reports_view", name: "View Reports", description: "Access standard reports", category: "Reports" },
  { id: "reports_create", name: "Create Reports", description: "Generate custom reports", category: "Reports" },
  { id: "reports_export", name: "Export Reports", description: "Export reports to various formats", category: "Reports" },
  { id: "reports_financial", name: "Financial Reports", description: "Access financial and revenue reports", category: "Reports" },
  
  // Settings
  { id: "settings_view", name: "View Settings", description: "View system settings", category: "Settings" },
  { id: "settings_edit", name: "Edit Settings", description: "Modify system settings", category: "Settings" },
  { id: "settings_users", name: "Manage Users", description: "Create and manage user accounts", category: "Settings" },
  { id: "settings_roles", name: "Manage Roles", description: "Create and manage user roles", category: "Settings" },
  
  // Financial
  { id: "financial_view", name: "View Financial Data", description: "View financial information and transactions", category: "Financial" },
  { id: "financial_edit", name: "Edit Financial Data", description: "Modify financial records", category: "Financial" },
  { id: "financial_reports", name: "Financial Reports", description: "Generate financial reports", category: "Financial" },
];

const mockRoles: Role[] = [
  {
    id: "1",
    name: "Super Admin",
    description: "Full system access with all permissions - Highest Authority",
    permissions: allPermissions.map(p => p.id),
    isSystem: true,
    userCount: 1,
    hierarchy: 10,
    createdDate: "2024-01-01",
    updatedDate: "2024-01-01",
  },
  {
    id: "2",
    name: "Admin",
    description: "High level access to manage company operations",
    permissions: [
      "prop_view", "prop_edit", "prop_create", "prop_delete", "prop_pictures",
      "tenant_view", "tenant_create", "tenant_edit", "tenant_delete",
      "wo_view", "wo_create", "wo_assign", "wo_edit", "wo_delete",
      "reports_view", "reports_custom", "marketing_view", "marketing_edit",
      "financial_view", "financial_edit", "settings_company", "settings_users"
    ],
    isSystem: true,
    userCount: 2,
    hierarchy: 8,
    createdDate: "2024-01-01",
    updatedDate: "2024-01-01",
  },
  {
    id: "3",
    name: "Manager",
    description: "Regional or departmental management access",
    permissions: [
      "prop_view", "prop_edit", "prop_pictures",
      "tenant_view", "tenant_create", "tenant_edit",
      "wo_view", "wo_create", "wo_assign", "wo_edit",
      "reports_view", "marketing_view", "financial_view"
    ],
    isSystem: true,
    userCount: 1,
    hierarchy: 6,
    createdDate: "2024-01-01",
    updatedDate: "2024-01-01",
  },
  {
    id: "4",
    name: "Property Manager",
    description: "Manage properties, tenants, and work orders",
    permissions: [
      "prop_view", "prop_edit", "prop_pictures",
      "tenant_view", "tenant_create", "tenant_edit",
      "wo_view", "wo_create", "wo_assign", "wo_edit",
      "reports_view", "marketing_view"
    ],
    isSystem: false,
    userCount: 3,
    hierarchy: 4,
    createdDate: "2024-01-15",
    updatedDate: "2024-01-20",
  },
  {
    id: "5",
    name: "User",
    description: "Standard user access for viewing and basic operations",
    permissions: [
      "prop_view", "tenant_view", "reports_view", "marketing_view"
    ],
    isSystem: true,
    userCount: 1,
    hierarchy: 2,
    createdDate: "2024-01-01",
    updatedDate: "2024-01-01",
  },
  {
    id: "6",
    name: "Tenant",
    description: "Basic tenant access to own information",
    permissions: [
      "tenant_view_own", "tenant_payments", "wo_create"
    ],
    isSystem: true,
    userCount: 1,
    hierarchy: 1,
    createdDate: "2024-01-01",
    updatedDate: "2024-01-01",
  },
  {
    id: "7",
    name: "Service Provider",
    description: "External service provider access for work orders",
    permissions: [
      "wo_view", "wo_edit", "reports_view"
    ],
    isSystem: true,
    userCount: 1,
    hierarchy: 1,
    createdDate: "2024-01-01",
    updatedDate: "2024-01-01",
  },
  {
    id: "8",
    name: "Maintenance Coordinator",
    description: "Specialized role for work order management",
    permissions: [
      "wo_view", "wo_create", "wo_assign", "wo_edit",
      "prop_view", "manager_view",
      "reports_view"
    ],
    isSystem: false,
    userCount: 2,
    hierarchy: 3,
    createdDate: "2024-01-15",
    updatedDate: "2024-01-15",
  },
  {
    id: "9",
    name: "Accountant",
    description: "Financial management and reporting access",
    permissions: [
      "financial_view", "financial_edit", "financial_reports",
      "reports_view", "reports_create", "reports_export",
      "tenant_view", "tenant_payments",
      "prop_view"
    ],
    isSystem: false,
    userCount: 1,
    hierarchy: 3,
    createdDate: "2024-01-20",
    updatedDate: "2024-01-25",
  },
  {
    id: "5",
    name: "Marketing Specialist",
    description: "Marketing campaigns and tenant communication",
    permissions: [
      "marketing_view", "marketing_create", "marketing_send", "marketing_templates",
      "tenant_view", "prop_view",
      "reports_view"
    ],
    isSystem: false,
    userCount: 1,
    createdDate: "2024-01-25",
    updatedDate: "2024-01-25",
  },
  {
    id: "6",
    name: "Tenant",
    description: "Limited access to own property data and communications",
    permissions: [
      "tenant_own_view", "tenant_own_wo", "tenant_own_communication",
      "prop_view" // Limited to own property only
    ],
    isSystem: false,
    userCount: 0,
    createdDate: "2024-01-30",
    updatedDate: "2024-01-30",
  },
];

const mockUsers: User[] = [
  {
    id: "1",
    firstName: "Alex",
    lastName: "Thompson",
    email: "alex@acmecrm.com",
    roleId: "1",
    status: "Active",
    lastLogin: "2024-01-30T09:00:00Z",
    profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
  },
  {
    id: "2",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@company.com",
    roleId: "2",
    status: "Active",
    lastLogin: "2024-01-29T16:30:00Z",
    profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  },
  {
    id: "3",
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@company.com",
    roleId: "2",
    status: "Active",
    lastLogin: "2024-01-30T08:15:00Z",
    profilePicture: "https://images.unsplash.com/photo-1494790108755-2616b612c94c?w=150",
  },
  {
    id: "4",
    firstName: "Mike",
    lastName: "Wilson",
    email: "mike.wilson@company.com",
    roleId: "3",
    status: "Inactive",
    lastLogin: "2024-01-28T14:20:00Z",
    profilePicture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
  },
];

export default function UserRoles() {
  const { state } = useCrmData();
  const { properties } = state;
  const { users: authUsers, addUser, updateUser, deleteUser } = useAuth();
  const [roles, setRoles] = React.useState<Role[]>(mockRoles);

  // Map AuthContext users to UserRoles interface
  const users = authUsers.map(authUser => {
    // Map auth role to role ID
    const roleMapping: Record<string, string> = {
      'Admin': '1',
      'Property Manager': '2',
      'Tenant': '6',
      'Service Provider': '4',
    };

    return {
      id: authUser.id,
      firstName: authUser.firstName,
      lastName: authUser.lastName,
      email: authUser.email,
      roleId: roleMapping[authUser.role] || "1",
      status: authUser.status,
      lastLogin: authUser.lastLogin,
      profilePicture: authUser.avatar,
    };
  });
  const [searchTerm, setSearchTerm] = React.useState("");
  const [openRoleDialog, setOpenRoleDialog] = React.useState(false);
  const [openUserDialog, setOpenUserDialog] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [activeTab, setActiveTab] = React.useState<"roles" | "users">("roles");
  
  const [roleFormData, setRoleFormData] = React.useState({
    name: "",
    description: "",
    permissions: [] as string[],
  });

  const [userFormData, setUserFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    roleId: "",
    password: "",
    status: "Active" as User["status"],
    linkedPropertyId: "",
    preferredLanguage: "en",
    timezone: "UTC",
    countryCode: "US",
  });

  const [assignRoleDialogOpen, setAssignRoleDialogOpen] = React.useState(false);
  const [bulkAssignUsers, setBulkAssignUsers] = React.useState<string[]>([]);
  const [bulkAssignRole, setBulkAssignRole] = React.useState("");

  const handleCreateRole = () => {
    setSelectedRole(null);
    setRoleFormData({
      name: "",
      description: "",
      permissions: [],
    });
    setOpenRoleDialog(true);
  };

  const handleEditRole = (role: Role) => {
    if (role.isSystem) {
      alert("System roles cannot be edited");
      return;
    }
    setSelectedRole(role);
    setRoleFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setOpenRoleDialog(true);
  };

  const handleSaveRole = () => {
    if (selectedRole) {
      // Edit existing role
      setRoles(prev => 
        prev.map(r => 
          r.id === selectedRole.id 
            ? { 
                ...r, 
                ...roleFormData, 
                updatedDate: new Date().toISOString().split('T')[0]
              }
            : r
        )
      );
    } else {
      // Add new role
      const newRole: Role = {
        id: Date.now().toString(),
        ...roleFormData,
        isSystem: false,
        userCount: 0,
        createdDate: new Date().toISOString().split('T')[0],
        updatedDate: new Date().toISOString().split('T')[0],
      };
      setRoles(prev => [...prev, newRole]);
    }
    setOpenRoleDialog(false);
  };

  const handleDeleteRole = (id: string) => {
    const role = roles.find(r => r.id === id);
    if (role?.isSystem) {
      alert("System roles cannot be deleted");
      return;
    }
    if (role && role.userCount > 0) {
      alert("Cannot delete role that has assigned users");
      return;
    }
    setRoles(prev => prev.filter(r => r.id !== id));
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setUserFormData({
      firstName: "",
      lastName: "",
      email: "",
      roleId: "",
      password: "",
      status: "Active",
      linkedPropertyId: "",
      preferredLanguage: "en",
      timezone: "UTC",
      countryCode: "US",
    });
    setOpenUserDialog(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roleId: user.roleId,
      password: "",
      status: user.status,
      linkedPropertyId: user.linkedPropertyId || "",
      preferredLanguage: user.preferredLanguage || "en",
      timezone: user.timezone || "UTC",
      countryCode: user.countryCode || "US",
    });
    setOpenUserDialog(true);
  };

  const handleSaveUser = () => {
    if (selectedUser) {
      // Edit existing user - find the auth user and update
      const authUser = authUsers.find(u => u.id === selectedUser.id);
      if (authUser) {
        updateUser(authUser.id, {
          firstName: userFormData.firstName,
          lastName: userFormData.lastName,
          email: userFormData.email,
          status: userFormData.status,
        });
      }
    } else {
      // Add new user to AuthContext
      // Map roleId to UserRole
      const roleIdToUserRole: Record<string, UserRole> = {
        '1': 'Admin',
        '2': 'Property Manager',
        '4': 'Service Provider',
        '6': 'Tenant',
      };

      const selectedRole = roleIdToUserRole[userFormData.roleId] || 'Admin';

      const newAuthUser = addUser({
        firstName: userFormData.firstName,
        lastName: userFormData.lastName,
        email: userFormData.email,
        role: selectedRole,
        status: userFormData.status,
        permissions: selectedRole === 'Admin' ? ['all'] : [], // Will be set by role permissions
      });

      // Update role user count
      setRoles(prev =>
        prev.map(r =>
          r.id === userFormData.roleId
            ? { ...r, userCount: r.userCount + 1 }
            : r
        )
      );
    }
    setOpenUserDialog(false);
  };

  const handleDeleteUser = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) {
      deleteUser(id); // Use AuthContext delete function
      // Update role user count
      setRoles(prev => 
        prev.map(r => 
          r.id === user.roleId 
            ? { ...r, userCount: Math.max(0, r.userCount - 1) }
            : r
        )
      );
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setRoleFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const getPermissionsByCategory = (category: Permission["category"]) => {
    return allPermissions.filter(p => p.category === category);
  };

  const getRoleName = (roleId: string) => {
    return roles.find(r => r.id === roleId)?.name || "Unknown Role";
  };

  const getStatusColor = (status: User["status"]) => {
    switch (status) {
      case "Active": return "success";
      case "Inactive": return "error";
      case "Pending": return "warning";
      default: return "default";
    }
  };

  const getHierarchyLabel = (hierarchy: number) => {
    switch (hierarchy) {
      case 10: return "Supreme Authority";
      case 8: return "High Authority";
      case 6: return "Medium-High Authority";
      case 4: return "Medium Authority";
      case 3: return "Limited Authority";
      case 2: return "Standard Authority";
      case 1: return "Basic Authority";
      default: return "Unknown Level";
    }
  };

  const getHierarchyColor = (hierarchy: number) => {
    if (hierarchy >= 8) return "error"; // Red for highest levels
    if (hierarchy >= 6) return "warning"; // Orange for high levels
    if (hierarchy >= 4) return "primary"; // Blue for medium levels
    if (hierarchy >= 2) return "info"; // Light blue for standard
    return "default"; // Grey for basic
  };

  // Bulk Role Assignment Functions
  const handleBulkAssign = () => {
    if (bulkAssignUsers.length === 0 || !bulkAssignRole) {
      alert("Please select users and a role");
      return;
    }

    setUsers(prev => prev.map(user =>
      bulkAssignUsers.includes(user.id)
        ? { ...user, roleId: bulkAssignRole }
        : user
    ));

    // Update role user counts
    setRoles(prev => prev.map(role => ({
      ...role,
      userCount: users.filter(user =>
        bulkAssignUsers.includes(user.id) ? bulkAssignRole === role.id : user.roleId === role.id
      ).length
    })));

    setBulkAssignUsers([]);
    setBulkAssignRole("");
    setAssignRoleDialogOpen(false);
    alert(`Successfully assigned ${bulkAssignUsers.length} users to new role`);
  };

  const handleUserStatusChange = (userId: string, newStatus: User["status"]) => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const handleDuplicateRole = (role: Role) => {
    if (role.isSystem) {
      alert("System roles cannot be duplicated");
      return;
    }

    const newRole: Role = {
      ...role,
      id: Date.now().toString(),
      name: `${role.name} (Copy)`,
      isSystem: false,
      userCount: 0,
      createdDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0],
    };

    setRoles(prev => [...prev, newRole]);
    alert("Role duplicated successfully");
  };

  const filteredRoles = roles
    .filter(role =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.hierarchy - a.hierarchy); // Sort by hierarchy (highest authority first)

  const filteredUsers = users.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getRoleName(user.roleId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRoles = roles.length;
  const customRoles = roles.filter(r => !r.isSystem).length;
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === "Active").length;

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" component="h1">
          User Roles & Permissions
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<GroupRoundedIcon />}
            onClick={() => setAssignRoleDialogOpen(true)}
            disabled={activeTab !== "users"}
          >
            Bulk Assign Roles
          </Button>
          <Button
            variant="outlined"
            startIcon={<PersonRoundedIcon />}
            onClick={handleCreateUser}
          >
            Add User
          </Button>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleCreateRole}
          >
            Create Role
          </Button>
        </Stack>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <SecurityRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Total Roles
                  </Typography>
                  <Typography variant="h4">{totalRoles}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "info.main" }}>
                  <AdminPanelSettingsRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Custom Roles
                  </Typography>
                  <Typography variant="h4">{customRoles}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "success.main" }}>
                  <GroupRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Total Users
                  </Typography>
                  <Typography variant="h4">{totalUsers}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: "warning.main" }}>
                  <PersonRoundedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Active Users
                  </Typography>
                  <Typography variant="h4">{activeUsers}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tab Selection */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2}>
          <Button
            variant={activeTab === "roles" ? "contained" : "outlined"}
            onClick={() => setActiveTab("roles")}
          >
            Roles ({totalRoles})
          </Button>
          <Button
            variant={activeTab === "users" ? "contained" : "outlined"}
            onClick={() => setActiveTab("users")}
          >
            Users ({totalUsers})
          </Button>
        </Stack>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab
            value="roles"
            label={`Roles (${totalRoles})`}
            icon={<SecurityRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="users"
            label={`Users (${totalUsers})`}
            icon={<PersonRoundedIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Roles Table */}
      {activeTab === "roles" && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Role</TableCell>
                <TableCell>Authority Level</TableCell>
                <TableCell>Users</TableCell>
                <TableCell>Permissions</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: role.isSystem ? "error.main" : "primary.light" }}>
                        {role.isSystem ? <AdminPanelSettingsRoundedIcon /> : <SecurityRoundedIcon />}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {role.name}
                          {role.isSystem && (
                            <Chip 
                              label="SYSTEM" 
                              size="small" 
                              color="error" 
                              sx={{ ml: 1, fontSize: '10px', height: '20px' }}
                            />
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {role.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="column" alignItems="center" spacing={1}>
                      <Chip
                        label={`Level ${role.hierarchy}`}
                        size="small"
                        color={getHierarchyColor(role.hierarchy) as any}
                        variant="filled"
                      />
                      <Typography variant="caption" color="text.secondary" textAlign="center">
                        {getHierarchyLabel(role.hierarchy)}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="h6">
                      {role.userCount}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Last updated: {new Date(role.updatedDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(role.createdDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditRole(role)}
                        disabled={role.isSystem}
                      >
                        <EditRoundedIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleDuplicateRole(role)}
                      >
                        <ContentCopyRoundedIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteRole(role.id)}
                        disabled={role.isSystem || role.userCount > 0}
                      >
                        <DeleteRoundedIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Users Table */}
      {activeTab === "users" && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar 
                        src={user.profilePicture} 
                        sx={{ bgcolor: "primary.light" }}
                      >
                        {!user.profilePicture && `${user.firstName[0]}${user.lastName[0]}`}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {user.firstName} {user.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                        {user.linkedPropertyId && (
                          <Typography variant="caption" color="primary.main">
                            Property: {user.linkedPropertyId}
                          </Typography>
                        )}
                        {user.preferredLanguage && user.timezone && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {user.preferredLanguage.toUpperCase()} • {user.timezone}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={1}>
                      <Chip
                        label={getRoleName(user.roleId)}
                        color={getHierarchyColor(roles.find(r => r.id === user.roleId)?.hierarchy || 0) as any}
                        variant="filled"
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {getHierarchyLabel(roles.find(r => r.id === user.roleId)?.hierarchy || 0)}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={getStatusColor(user.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditUser(user)}
                      >
                        <EditRoundedIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <DeleteRoundedIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Role Dialog */}
      <Dialog open={openRoleDialog} onClose={() => setOpenRoleDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedRole ? "Edit Role" : "Create New Role"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Role Name"
                  fullWidth
                  required
                  value={roleFormData.name}
                  onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Description"
                  fullWidth
                  value={roleFormData.description}
                  onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                />
              </Grid>
            </Grid>

            <Divider />

            <Typography variant="h6">Permissions</Typography>
            
            {["Properties", "Tenants", "Managers", "Work Orders", "Marketing", "Reports", "Financial", "Settings"].map((category) => (
              <Accordion key={category}>
                <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Typography variant="subtitle1">{category}</Typography>
                    <Chip 
                      label={`${roleFormData.permissions.filter(p => 
                        getPermissionsByCategory(category as Permission["category"]).some(perm => perm.id === p)
                      ).length}/${getPermissionsByCategory(category as Permission["category"]).length}`}
                      size="small"
                      color="primary"
                    />
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <FormGroup>
                    {getPermissionsByCategory(category as Permission["category"]).map((permission) => (
                      <FormControlLabel
                        key={permission.id}
                        control={
                          <Checkbox
                            checked={roleFormData.permissions.includes(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2">{permission.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {permission.description}
                            </Typography>
                          </Box>
                        }
                      />
                    ))}
                  </FormGroup>
                </AccordionDetails>
              </Accordion>
            ))}

            <Alert severity="info">
              <Typography variant="body2">
                Selected permissions: {roleFormData.permissions.length} out of {allPermissions.length}
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRoleDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveRole}>
            {selectedRole ? "Update" : "Create"} Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit User Dialog */}
      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? "Edit User" : "Add New User"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="First Name"
                  fullWidth
                  required
                  value={userFormData.firstName}
                  onChange={(e) => setUserFormData({ ...userFormData, firstName: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Last Name"
                  fullWidth
                  required
                  value={userFormData.lastName}
                  onChange={(e) => setUserFormData({ ...userFormData, lastName: e.target.value })}
                />
              </Grid>
            </Grid>
            
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={userFormData.email}
              onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
            />
            
            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                value={userFormData.roleId}
                label="Role"
                onChange={(e) => setUserFormData({ ...userFormData, roleId: e.target.value })}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                    {role.isSystem && " (System)"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {!selectedUser && (
              <TextField
                label="Initial Password"
                type="password"
                fullWidth
                required
                value={userFormData.password}
                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                helperText="User will be prompted to change password on first login"
              />
            )}

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={userFormData.status}
                label="Status"
                onChange={(e) => setUserFormData({ ...userFormData, status: e.target.value as User["status"] })}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
              </Select>
            </FormControl>

            {/* Tenant-specific fields */}
            {roles.find(r => r.id === userFormData.roleId)?.name === "Tenant" && (
              <FormControl fullWidth required>
                <InputLabel>Linked Property</InputLabel>
                <Select
                  value={userFormData.linkedPropertyId}
                  label="Linked Property"
                  onChange={(e) => setUserFormData({ ...userFormData, linkedPropertyId: e.target.value })}
                >
                  <MenuItem value="">
                    <em>Select a property</em>
                  </MenuItem>
                  {properties.map((property) => (
                    <MenuItem key={property.id} value={property.id}>
                      {property.name} - {property.address}
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        (${property.monthlyRent.toLocaleString()}/mo)
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Property this tenant will be linked to</FormHelperText>
              </FormControl>
            )}

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={userFormData.preferredLanguage}
                    label="Language"
                    onChange={(e) => setUserFormData({ ...userFormData, preferredLanguage: e.target.value })}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Español</MenuItem>
                    <MenuItem value="fr">Français</MenuItem>
                    <MenuItem value="de">Deutsch</MenuItem>
                    <MenuItem value="it">Italiano</MenuItem>
                    <MenuItem value="pt">Português</MenuItem>
                    <MenuItem value="zh">中文</MenuItem>
                    <MenuItem value="ja">日本語</MenuItem>
                    <MenuItem value="ko">한국어</MenuItem>
                    <MenuItem value="ar">العربية</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={userFormData.timezone}
                    label="Timezone"
                    onChange={(e) => setUserFormData({ ...userFormData, timezone: e.target.value })}
                  >
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="America/New_York">Eastern Time</MenuItem>
                    <MenuItem value="America/Chicago">Central Time</MenuItem>
                    <MenuItem value="America/Denver">Mountain Time</MenuItem>
                    <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                    <MenuItem value="Europe/London">London</MenuItem>
                    <MenuItem value="Europe/Paris">Paris</MenuItem>
                    <MenuItem value="Europe/Berlin">Berlin</MenuItem>
                    <MenuItem value="Asia/Tokyo">Tokyo</MenuItem>
                    <MenuItem value="Asia/Shanghai">Shanghai</MenuItem>
                    <MenuItem value="Asia/Dubai">Dubai</MenuItem>
                    <MenuItem value="Australia/Sydney">Sydney</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={userFormData.countryCode}
                    label="Country"
                    onChange={(e) => setUserFormData({ ...userFormData, countryCode: e.target.value })}
                  >
                    <MenuItem value="US">United States</MenuItem>
                    <MenuItem value="CA">Canada</MenuItem>
                    <MenuItem value="GB">United Kingdom</MenuItem>
                    <MenuItem value="FR">France</MenuItem>
                    <MenuItem value="DE">Germany</MenuItem>
                    <MenuItem value="IT">Italy</MenuItem>
                    <MenuItem value="ES">Spain</MenuItem>
                    <MenuItem value="PT">Portugal</MenuItem>
                    <MenuItem value="CN">China</MenuItem>
                    <MenuItem value="JP">Japan</MenuItem>
                    <MenuItem value="KR">South Korea</MenuItem>
                    <MenuItem value="AE">UAE</MenuItem>
                    <MenuItem value="AU">Australia</MenuItem>
                    <MenuItem value="MX">Mexico</MenuItem>
                    <MenuItem value="BR">Brazil</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveUser}>
            {selectedUser ? "Update" : "Add"} User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Role Assignment Dialog */}
      <Dialog open={assignRoleDialogOpen} onClose={() => setAssignRoleDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Bulk Role Assignment</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              Select users and assign them to a new role. This will update their permissions immediately.
            </Alert>

            <FormControl fullWidth required>
              <InputLabel>Select Role to Assign</InputLabel>
              <Select
                value={bulkAssignRole}
                label="Select Role to Assign"
                onChange={(e) => setBulkAssignRole(e.target.value)}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name} ({role.userCount} current users)
                    {role.isSystem && " (System)"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="subtitle1">Select Users:</Typography>
            <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto', p: 1 }}>
              <FormGroup>
                {users.map((user) => (
                  <FormControlLabel
                    key={user.id}
                    control={
                      <Checkbox
                        checked={bulkAssignUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBulkAssignUsers(prev => [...prev, user.id]);
                          } else {
                            setBulkAssignUsers(prev => prev.filter(id => id !== user.id));
                          }
                        }}
                      />
                    }
                    label={
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {user.firstName[0]}{user.lastName[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2">
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email} • Current role: {getRoleName(user.roleId)}
                          </Typography>
                        </Box>
                        <Chip
                          label={user.status}
                          color={getStatusColor(user.status)}
                          size="small"
                        />
                      </Stack>
                    }
                  />
                ))}
              </FormGroup>
            </Paper>

            <Typography variant="body2" color="text.secondary">
              Selected: {bulkAssignUsers.length} user(s)
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAssignRoleDialogOpen(false);
            setBulkAssignUsers([]);
            setBulkAssignRole("");
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleBulkAssign}
            disabled={bulkAssignUsers.length === 0 || !bulkAssignRole}
          >
            Assign Role to {bulkAssignUsers.length} User(s)
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
