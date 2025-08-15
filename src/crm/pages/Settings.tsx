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
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Alert,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import CompanySettings, { useCompanyInfo } from "../components/CompanySettings";

// Mock user data and types (would normally come from AuthContext)
type UserRole = 'Admin' | 'Property Manager' | 'Tenant' | 'Service Provider';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: 'Active' | 'Inactive' | 'Pending';
  permissions: string[];
  lastLogin?: string;
  createdAt: string;
}

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
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@propcrm.com',
    phone: '(555) 111-2222',
    role: 'Property Manager',
    status: 'Active',
    permissions: ['manage_properties', 'manage_tenants'],
    lastLogin: '2024-01-15T10:30:00Z',
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    role: 'Tenant',
    status: 'Active',
    permissions: ['view_profile', 'pay_rent'],
    lastLogin: '2024-01-14T15:20:00Z',
    createdAt: '2024-01-03T00:00:00Z',
  },
];

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Settings() {
  const [users, setUsers] = React.useState<User[]>(mockUsers);
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [openUserDialog, setOpenUserDialog] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [userFormData, setUserFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "Tenant" as UserRole,
    status: "Active" as "Active" | "Inactive" | "Pending",
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setUserFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "Tenant",
      status: "Active",
    });
    setOpenUserDialog(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      status: user.status,
    });
    setOpenUserDialog(true);
  };

  const handleSaveUser = () => {
    if (selectedUser) {
      setUsers(prev => 
        prev.map(u => 
          u.id === selectedUser.id 
            ? { ...u, ...userFormData }
            : u
        )
      );
    } else {
      const newUser: User = {
        id: Date.now().toString(),
        ...userFormData,
        permissions: [],
        createdAt: new Date().toISOString(),
      };
      setUsers(prev => [...prev, newUser]);
    }
    setOpenUserDialog(false);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const filteredUsers = users.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: User["status"]) => {
    switch (status) {
      case "Active": return "success";
      case "Pending": return "warning";
      case "Inactive": return "error";
      default: return "default";
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "Admin": return "error";
      case "Property Manager": return "primary";
      case "Tenant": return "info";
      case "Service Provider": return "warning";
      default: return "default";
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Settings
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="User Management" icon={<PeopleRoundedIcon />} iconPosition="start" />
          <Tab label="Security" icon={<SecurityRoundedIcon />} iconPosition="start" />
          <Tab label="System" icon={<SettingsRoundedIcon />} iconPosition="start" />
          <Tab label="Notifications" icon={<NotificationsRoundedIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      <TabPanel value={selectedTab} index={0}>
        {/* User Management */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h5">
            User Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleAddUser}
          >
            Add User
          </Button>
        </Stack>

        {/* User Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <PeopleRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      Total Users
                    </Typography>
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
                  <Avatar sx={{ bgcolor: "success.main" }}>
                    <PeopleRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      Active Users
                    </Typography>
                    <Typography variant="h4">{users.filter(u => u.status === 'Active').length}</Typography>
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
                    <PeopleRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      Tenants
                    </Typography>
                    <Typography variant="h4">{users.filter(u => u.role === 'Tenant').length}</Typography>
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
                    <PeopleRoundedIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">
                      Managers
                    </Typography>
                    <Typography variant="h4">{users.filter(u => u.role === 'Property Manager').length}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search users..."
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

        {/* Users Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Contact</TableCell>
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
                      <Avatar sx={{ bgcolor: getRoleColor(user.role) + ".light" }}>
                        {user.firstName[0]}{user.lastName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {user.firstName} {user.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.phone || 'No phone'}
                    </Typography>
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
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
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
                        disabled={user.id === '1'} // Prevent deleting admin
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
      </TabPanel>

      <TabPanel value={selectedTab} index={1}>
        <Typography variant="h5" sx={{ mb: 2 }}>Security Settings</Typography>
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Require two-factor authentication"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Force password reset every 90 days"
              />
              <FormControlLabel
                control={<Switch />}
                label="Allow third-party integrations"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Log user activities"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Encrypt sensitive data"
              />
            </Stack>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={selectedTab} index={2}>
        <Typography variant="h5" sx={{ mb: 2 }}>System Settings</Typography>
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <TextField label="Company Name" defaultValue="PropCRM" fullWidth />
              <TextField label="System Email" defaultValue="noreply@propcrm.com" fullWidth />
              <TextField label="Default Timezone" defaultValue="America/New_York" fullWidth />
              <TextField label="Currency" defaultValue="USD" fullWidth />
              <TextField label="Date Format" defaultValue="MM/DD/YYYY" fullWidth />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Enable automatic backups"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Send system notifications"
              />
              <FormControlLabel
                control={<Switch />}
                label="Maintenance mode"
              />
            </Stack>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={selectedTab} index={3}>
        <Typography variant="h5" sx={{ mb: 2 }}>Notification Settings</Typography>
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Typography variant="h6">Email Notifications</Typography>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Email notifications for new tenants"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Email alerts for maintenance requests"
              />
              <FormControlLabel
                control={<Switch />}
                label="Daily reports"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Rent collection reminders"
              />
              
              <Typography variant="h6" sx={{ mt: 3 }}>SMS Notifications</Typography>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="SMS alerts for urgent maintenance"
              />
              <FormControlLabel
                control={<Switch />}
                label="SMS rent reminders"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="SMS security alerts"
              />
            </Stack>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Add/Edit User Dialog */}
      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} maxWidth="md" fullWidth>
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
                  value={userFormData.firstName}
                  onChange={(e) => setUserFormData({ ...userFormData, firstName: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Last Name"
                  fullWidth
                  value={userFormData.lastName}
                  onChange={(e) => setUserFormData({ ...userFormData, lastName: e.target.value })}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Phone"
                  fullWidth
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={userFormData.role}
                    label="Role"
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as UserRole })}
                  >
                    <MenuItem value="Tenant">Tenant</MenuItem>
                    <MenuItem value="Property Manager">Property Manager</MenuItem>
                    <MenuItem value="Service Provider">Service Provider</MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={userFormData.status}
                    label="Status"
                    onChange={(e) => setUserFormData({ ...userFormData, status: e.target.value as "Active" | "Inactive" | "Pending" })}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
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
    </Box>
  );
}
