import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Tabs,
  Tab,
  Grid,
  Avatar,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  PersonAdd,
  Edit,
  Delete,
  MoreVert,
  Block,
  CheckCircle,
  Email,
  Phone,
  Business,
  AccessTime,
  Language,
  Security,
  Refresh,
  Download,
  Search
} from '@mui/icons-material';
import { DatabaseUserService, DatabaseUser, CreateUserData } from '../services/DatabaseUserService';
import { PasswordService } from '../services/PasswordService';
import UserRegistration from './UserRegistration';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const roleOptions = [
  { value: 'User', label: 'User', color: 'default' },
  { value: 'Property Manager', label: 'Property Manager', color: 'primary' },
  { value: 'Manager', label: 'Manager', color: 'secondary' },
  { value: 'Admin', label: 'Admin', color: 'error' },
  { value: 'Super Admin', label: 'Super Admin', color: 'warning' }
];

const statusOptions = [
  { value: 'Active', label: 'Active', color: 'success' },
  { value: 'Inactive', label: 'Inactive', color: 'error' },
  { value: 'Pending', label: 'Pending', color: 'warning' }
];

export default function AdminUserManagement() {
  const [users, setUsers] = useState<DatabaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [selectedUser, setSelectedUser] = useState<DatabaseUser | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'create' | 'edit' | 'delete' | 'details'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data for create/edit
  const [formData, setFormData] = useState<CreateUserData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'User',
    timezone: 'UTC',
    preferredLanguage: 'en',
    countryCode: 'US'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // In production, fetch from database
      const mockUsers: DatabaseUser[] = [
        {
          id: '1',
          email: 'superadmin@propcrm.com',
          firstName: 'Super',
          lastName: 'Administrator',
          role: 'Super Admin',
          status: 'Active',
          timezone: 'UTC',
          preferredLanguage: 'en',
          countryCode: 'US',
          emailVerified: true,
          loginCount: 245,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date()
        },
        {
          id: '2',
          email: 'admin@propcrm.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'Admin',
          status: 'Active',
          timezone: 'America/New_York',
          preferredLanguage: 'en',
          countryCode: 'US',
          emailVerified: true,
          loginCount: 156,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date()
        },
        {
          id: '3',
          email: 'manager@propcrm.com',
          firstName: 'Property',
          lastName: 'Manager',
          role: 'Property Manager',
          status: 'Active',
          timezone: 'America/Los_Angeles',
          preferredLanguage: 'en',
          countryCode: 'US',
          emailVerified: true,
          loginCount: 89,
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date()
        },
        {
          id: '4',
          email: 'newuser@propcrm.com',
          firstName: 'New',
          lastName: 'User',
          role: 'User',
          status: 'Pending',
          timezone: 'UTC',
          preferredLanguage: 'en',
          countryCode: 'US',
          emailVerified: false,
          loginCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      setUsers(mockUsers);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      const newUser = await DatabaseUserService.createUser(formData);
      setUsers(prev => [...prev, newUser]);
      setSuccess('User created successfully');
      setDialogOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      const success = await DatabaseUserService.updateUser(selectedUser.id, formData as any);
      if (success) {
        setUsers(prev => prev.map(user => 
          user.id === selectedUser.id 
            ? { ...user, ...formData, updatedAt: new Date() }
            : user
        ));
        setSuccess('User updated successfully');
        setDialogOpen(false);
        resetForm();
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      // In production, call delete API
      setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
      setSuccess('User deleted successfully');
      setDialogOpen(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: 'Active' | 'Inactive' | 'Pending') => {
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, status: newStatus, updatedAt: new Date() }
          : user
      ));
      setSuccess(`User status updated to ${newStatus}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'User',
      timezone: 'UTC',
      preferredLanguage: 'en',
      countryCode: 'US'
    });
    setSelectedUser(null);
  };

  const openDialog = (type: typeof dialogType, user?: DatabaseUser) => {
    setDialogType(type);
    if (user) {
      setSelectedUser(user);
      setFormData({
        email: user.email,
        password: '', // Never pre-fill password
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        role: user.role,
        timezone: user.timezone,
        preferredLanguage: user.preferredLanguage,
        countryCode: user.countryCode
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
    setActionMenuAnchor(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesStatus = !filterStatus || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    const roleOption = roleOptions.find(r => r.value === role);
    return roleOption?.color || 'default';
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption?.color || 'default';
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => openDialog('create')}
        >
          Add User
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="All Users" />
              <Tab label="User Registration" />
              <Tab label="Bulk Operations" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {/* Filters and Search */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={filterRole}
                    label="Role"
                    onChange={(e) => setFilterRole(e.target.value)}
                  >
                    <MenuItem value="">All Roles</MenuItem>
                    {roleOptions.map(role => (
                      <MenuItem key={role.value} value={role.value}>
                        {role.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Status"
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="">All Status</MenuItem>
                    {statusOptions.map(status => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={1}>
                  <Button
                    startIcon={<Refresh />}
                    onClick={loadUsers}
                    disabled={loading}
                  >
                    Refresh
                  </Button>
                  <Button
                    startIcon={<Download />}
                    variant="outlined"
                  >
                    Export
                  </Button>
                </Stack>
              </Grid>
            </Grid>

            {/* Users Table */}
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Email Verified</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
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
                          color={getRoleColor(user.role) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          color={getStatusColor(user.status) as any}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {user.emailVerified ? (
                          <CheckCircle color="success" fontSize="small" />
                        ) : (
                          <Block color="error" fontSize="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? (
                          <Typography variant="body2">
                            {user.lastLogin.toLocaleDateString()}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Never
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {user.createdAt.toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={(e) => {
                            setSelectedUser(user);
                            setActionMenuAnchor(e.currentTarget);
                          }}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <UserRegistration />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Bulk Operations
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Bulk operations coming soon - mass user import, role changes, and status updates.
            </Alert>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={() => setActionMenuAnchor(null)}
      >
        <MenuItem onClick={() => openDialog('details', selectedUser)}>
          <ListItemIcon>
            <Security fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => openDialog('edit', selectedUser)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit User</ListItemText>
        </MenuItem>
        <Divider />
        {selectedUser?.status === 'Active' ? (
          <MenuItem onClick={() => handleStatusChange(selectedUser.id, 'Inactive')}>
            <ListItemIcon>
              <Block fontSize="small" />
            </ListItemIcon>
            <ListItemText>Deactivate</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleStatusChange(selectedUser.id, 'Active')}>
            <ListItemIcon>
              <CheckCircle fontSize="small" />
            </ListItemIcon>
            <ListItemText>Activate</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => openDialog('delete', selectedUser)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete User</ListItemText>
        </MenuItem>
      </Menu>

      {/* User Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'create' && 'Create New User'}
          {dialogType === 'edit' && 'Edit User'}
          {dialogType === 'delete' && 'Delete User'}
          {dialogType === 'details' && 'User Details'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'delete' ? (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Are you sure you want to delete {selectedUser?.firstName} {selectedUser?.lastName}? 
              This action cannot be undone.
            </Alert>
          ) : dialogType === 'details' ? (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography>{selectedUser?.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Role</Typography>
                <Typography>{selectedUser?.role}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Typography>{selectedUser?.status}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Timezone</Typography>
                <Typography>{selectedUser?.timezone}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Login Count</Typography>
                <Typography>{selectedUser?.loginCount}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Email Verified</Typography>
                <Typography>{selectedUser?.emailVerified ? 'Yes' : 'No'}</Typography>
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={dialogType === 'edit'}
                />
              </Grid>
              {dialogType === 'create' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    helperText="Minimum 8 characters with uppercase, lowercase, number, and special character"
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone (Optional)"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.role}
                    label="Role"
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    {roleOptions.map(role => (
                      <MenuItem key={role.value} value={role.value}>
                        {role.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          {dialogType === 'create' && (
            <Button onClick={handleCreateUser} variant="contained">
              Create User
            </Button>
          )}
          {dialogType === 'edit' && (
            <Button onClick={handleUpdateUser} variant="contained">
              Update User
            </Button>
          )}
          {dialogType === 'delete' && (
            <Button onClick={handleDeleteUser} variant="contained" color="error">
              Delete User
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
