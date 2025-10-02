import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Badge,
  Tooltip,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  CircularProgress,
  Divider,
  ClickAwayListener,
  Popper,
  Grow,
  MenuList,
  ListItemButton,
  CheckboxTree
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import AdminIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import KeyIcon from '@mui/icons-material/Key';
import ShieldIcon from '@mui/icons-material/Shield';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HistoryIcon from '@mui/icons-material/History';
import ReportIcon from '@mui/icons-material/Report';
import SettingsIcon from '@mui/icons-material/Settings';
import AlertIcon from '@mui/icons-material/NotificationImportant';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import ScheduleIcon from '@mui/icons-material/Schedule';
import GavelIcon from '@mui/icons-material/Gavel';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';;
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { accessControlService } from '../services/AccessControlService';
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
      id={`access-control-tabpanel-${index}`}
      aria-labelledby={`access-control-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const riskLevelColors = {
  low: 'success',
  medium: 'warning',
  high: 'error',
  critical: 'error'
};

export default function AccessControlDashboard() {
  const [currentTab, setCurrentTab] = React.useState(0);
  const [securityReport, setSecurityReport] = React.useState<any>(null);
  const [auditLogs, setAuditLogs] = React.useState<any[]>([]);
  const [roles, setRoles] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<any[]>([]);
  const [accessRequests, setAccessRequests] = React.useState<any[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<any>(null);
  const [selectedRole, setSelectedRole] = React.useState<any>(null);
  const [openUserDialog, setOpenUserDialog] = React.useState(false);
  const [openRoleDialog, setOpenRoleDialog] = React.useState(false);
  const [openPermissionDialog, setOpenPermissionDialog] = React.useState(false);
  const [openAuditDialog, setOpenAuditDialog] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  
  // Filters
  const [userFilter, setUserFilter] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('');
  const [auditFilter, setAuditFilter] = React.useState({
    userId: '',
    resource: '',
    action: '',
    success: 'all'
  });

  // Form states
  const [roleForm, setRoleForm] = React.useState({
    name: '',
    description: '',
    permissions: [] as any[],
    hierarchy: 1,
    inheritsFrom: [] as string[]
  });

  const [userRoleForm, setUserRoleForm] = React.useState({
    userId: '',
    roleId: '',
    reason: '',
    expiresAt: '',
    temporaryAccess: false
  });

  React.useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Generate security report
      const report = accessControlService.generateSecurityReport();
      setSecurityReport(report);

      // Load audit logs
      const logs = accessControlService.getAuditLogs({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      setAuditLogs(logs);

      // Load roles (simulated data)
      const rolesData = [
        { 
          id: 'super_admin', 
          name: 'Super Administrator', 
          description: 'Full system access',
          type: 'system',
          hierarchy: 10,
          userCount: 2,
          permissions: 15,
          isActive: true
        },
        { 
          id: 'property_manager', 
          name: 'Property Manager', 
          description: 'Manage properties and tenants',
          type: 'system',
          hierarchy: 7,
          userCount: 8,
          permissions: 12,
          isActive: true
        },
        { 
          id: 'maintenance_tech', 
          name: 'Maintenance Technician', 
          description: 'Handle work orders and maintenance',
          type: 'custom',
          hierarchy: 4,
          userCount: 5,
          permissions: 6,
          isActive: true
        },
        { 
          id: 'tenant', 
          name: 'Tenant', 
          description: 'Basic tenant access',
          type: 'system',
          hierarchy: 1,
          userCount: 150,
          permissions: 3,
          isActive: true
        }
      ];
      setRoles(rolesData);

      // Load users (simulated data)
      const usersData = [
        {
          id: '1',
          name: 'John Admin',
          email: 'john@propertycrm.com',
          roles: ['super_admin'],
          status: 'active',
          lastLogin: '2024-01-18T10:30:00Z',
          riskScore: 2
        },
        {
          id: '2',
          name: 'Sarah Manager',
          email: 'sarah@propertycrm.com',
          roles: ['property_manager'],
          status: 'active',
          lastLogin: '2024-01-18T09:15:00Z',
          riskScore: 1
        },
        {
          id: '3',
          name: 'Mike Tech',
          email: 'mike@propertycrm.com',
          roles: ['maintenance_tech'],
          status: 'active',
          lastLogin: '2024-01-17T16:45:00Z',
          riskScore: 3
        }
      ];
      setUsers(usersData);

      // Load access requests (simulated data)
      const requestsData = [
        {
          id: '1',
          userName: 'Alice Johnson',
          requestedRole: 'Property Manager',
          reason: 'Promotion to manager position',
          status: 'pending',
          requestedAt: '2024-01-18T08:00:00Z',
          urgency: 'medium'
        },
        {
          id: '2',
          userName: 'Bob Wilson',
          requestedRole: 'Maintenance Technician',
          reason: 'New hire - maintenance team',
          status: 'pending',
          requestedAt: '2024-01-17T14:30:00Z',
          urgency: 'high'
        }
      ];
      setAccessRequests(requestsData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = () => {
    // Implementation for assigning role
    console.log('Assigning role:', userRoleForm);
    setOpenUserDialog(false);
  };

  const handleCreateRole = () => {
    // Implementation for creating role
    console.log('Creating role:', roleForm);
    setOpenRoleDialog(false);
  };

  const handleApproveRequest = (requestId: string) => {
    setAccessRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'approved' } : req
    ));
  };

  const handleRejectRequest = (requestId: string) => {
    setAccessRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'rejected' } : req
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'suspended': return 'error';
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore <= 2) return 'success';
    if (riskScore <= 5) return 'warning';
    return 'error';
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      {/* Security Metrics */}
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Security Overview</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">Total Users</Typography>
                    <Typography variant="h4">{securityReport?.summary.totalUsers}</Typography>
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
                    <CheckCircleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">Active Users</Typography>
                    <Typography variant="h4">{securityReport?.summary.activeUsers}</Typography>
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
                    <AssignmentIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">Pending Requests</Typography>
                    <Typography variant="h4">{securityReport?.summary.pendingRequests}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: 'error.main' }}>
                    <WarningIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" color="text.secondary">Security Incidents</Typography>
                    <Typography variant="h4">{securityReport?.summary.securityIncidents}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Risk Analysis */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Risk Analysis</Typography>
            <Stack spacing={2}>
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">High Risk Actions</Typography>
                  <Typography variant="h6" color="error.main">
                    {securityReport?.riskAnalysis.highRiskActions}
                  </Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(100, (securityReport?.riskAnalysis.highRiskActions || 0) * 5)} 
                  color="error"
                  sx={{ mt: 1 }}
                />
              </Box>
              
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Suspicious Activity</Typography>
                  <Typography variant="h6" color="warning.main">
                    {securityReport?.riskAnalysis.suspiciousActivity}
                  </Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(100, (securityReport?.riskAnalysis.suspiciousActivity || 0) * 2)} 
                  color="warning"
                  sx={{ mt: 1 }}
                />
              </Box>
              
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Failed Login Attempts</Typography>
                  <Typography variant="h6" color="info.main">
                    {securityReport?.riskAnalysis.failedLoginAttempts}
                  </Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(100, (securityReport?.riskAnalysis.failedLoginAttempts || 0) * 10)} 
                  color="info"
                  sx={{ mt: 1 }}
                />
              </Box>
              
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Privileged Users</Typography>
                  <Typography variant="h6" color="secondary.main">
                    {securityReport?.riskAnalysis.privilegedUsers}
                  </Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(100, (securityReport?.riskAnalysis.privilegedUsers || 0) * 20)} 
                  color="secondary"
                  sx={{ mt: 1 }}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Role Distribution */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Role Distribution</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  dataKey="userCount"
                  data={roles}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ name, userCount }) => `${name}: ${userCount}`}
                >
                  {roles.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Security Recommendations */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Security Recommendations</Typography>
            <Stack spacing={2}>
              {securityReport?.recommendations?.map((recommendation: string, index: number) => (
                <Alert key={index} severity="warning" action={
                  <Button color="inherit" size="small">
                    Review
                  </Button>
                }>
                  {recommendation}
                </Alert>
              )) || (
                <Alert severity="success">
                  No immediate security concerns detected. All systems operating normally.
                </Alert>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Activity */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Recent Security Events</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Time</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Resource</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditLogs.slice(0, 5).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(log.timestamp)}
                        </Typography>
                      </TableCell>
                      <TableCell>{log.userId}</TableCell>
                      <TableCell>
                        <Chip 
                          label={log.action} 
                          size="small" 
                          color={log.success ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>{log.resource || 'System'}</TableCell>
                      <TableCell>
                        {log.success ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <CancelIcon color="error" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderUsersTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">User Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenUserDialog(true)}
          >
            Assign Role
          </Button>
        </Stack>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField
                placeholder="Search users..."
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                size="small"
              >
                Filter
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadDashboardData}
                size="small"
              >
                Refresh
              </Button>
            </Stack>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Roles</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell>Risk Score</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.filter(user => 
                    user.name.toLowerCase().includes(userFilter.toLowerCase()) ||
                    user.email.toLowerCase().includes(userFilter.toLowerCase())
                  ).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar>{user.name.charAt(0)}</Avatar>
                          <Box>
                            <Typography variant="subtitle2">{user.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.email}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                          {user.roles.map((roleId: string) => {
                            const role = roles.find(r => r.id === roleId);
                            return (
                              <Chip 
                                key={roleId}
                                label={role?.name || roleId} 
                                size="small" 
                                color="primary"
                                variant="outlined"
                              />
                            );
                          })}
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
                          {formatDateTime(user.lastLogin)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography 
                            variant="body2"
                            color={getRiskColor(user.riskScore) + '.main'}
                          >
                            {user.riskScore}/10
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={user.riskScore * 10}
                            color={getRiskColor(user.riskScore) as any}
                            sx={{ width: 60, height: 6, borderRadius: 3 }}
                          />
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Edit User" sx={uniformTooltipStyles}>
                            <IconButton 
                              size="small"
                              onClick={() => {
                                setSelectedUser(user);
                                setOpenUserDialog(true);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Permissions" sx={uniformTooltipStyles}>
                            <IconButton 
                              size="small"
                              onClick={() => setOpenPermissionDialog(true)}
                            >
                              <VpnKeyIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Audit Log" sx={uniformTooltipStyles}>
                            <IconButton 
                              size="small"
                              onClick={() => setOpenAuditDialog(true)}
                            >
                              <HistoryIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderRolesTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Role Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenRoleDialog(true)}
          >
            Create Role
          </Button>
        </Stack>
      </Grid>

      <Grid item xs={12}>
        <Grid container spacing={2}>
          {roles.map((role) => (
            <Grid item xs={12} md={6} lg={4} key={role.id}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="h6">{role.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {role.description}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <Chip 
                          label={role.type} 
                          size="small" 
                          color={role.type === 'system' ? 'primary' : 'secondary'}
                        />
                        <IconButton size="small">
                          <MoreVertIcon />
                        </IconButton>
                      </Stack>
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
                            {role.permissions}
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

                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button 
                        size="small" 
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => {
                          setSelectedRole(role);
                          setOpenRoleDialog(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined"
                        startIcon={<VpnKeyIcon />}
                        onClick={() => setOpenPermissionDialog(true)}
                      >
                        Permissions
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );

  const renderRequestsTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>Access Requests</Typography>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Requested Role</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Urgency</TableCell>
                    <TableCell>Requested</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accessRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <Typography variant="subtitle2">{request.userName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={request.requestedRole} size="small" color="primary" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200 }}>
                          {request.reason}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={request.urgency} 
                          size="small" 
                          color={
                            request.urgency === 'high' ? 'error' :
                            request.urgency === 'medium' ? 'warning' : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateTime(request.requestedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={request.status} 
                          size="small" 
                          color={getStatusColor(request.status) as any}
                        />
                      </TableCell>
                      <TableCell>
                        {request.status === 'pending' && (
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleApproveRequest(request.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleRejectRequest(request.id)}
                            >
                              Reject
                            </Button>
                          </Stack>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Access Control & Security
        </Typography>
        <Stack direction="row" spacing={2}>
          <Chip icon={<ShieldIcon />} label="Security Active" color="success" />
          <Button
            variant="outlined"
            startIcon={<ReportIcon />}
            onClick={() => console.log('Generate report')}
          >
            Generate Report
          </Button>
          <Button
            variant="contained"
            startIcon={<SettingsIcon />}
            onClick={() => console.log('Security settings')}
          >
            Security Settings
          </Button>
        </Stack>
      </Stack>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)}>
          <Tab
            icon={<AssessmentIcon />}
            label="Overview"
            iconPosition="start"
          />
          <Tab
            icon={<PersonIcon />}
            label="Users"
            iconPosition="start"
          />
          <Tab
            icon={<GroupIcon />}
            label="Roles"
            iconPosition="start"
          />
          <Tab
            icon={<AssignmentIcon />}
            label="Access Requests"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <TabPanel value={currentTab} index={0}>
        {renderOverviewTab()}
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        {renderUsersTab()}
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        {renderRolesTab()}
      </TabPanel>

      <TabPanel value={currentTab} index={3}>
        {renderRequestsTab()}
      </TabPanel>

      {/* Dialogs */}
      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Edit User Roles' : 'Assign Role to User'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>User</InputLabel>
              <Select
                value={userRoleForm.userId}
                label="User"
                onChange={(e) => setUserRoleForm({ ...userRoleForm, userId: e.target.value })}
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={userRoleForm.roleId}
                label="Role"
                onChange={(e) => setUserRoleForm({ ...userRoleForm, roleId: e.target.value })}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Reason"
              value={userRoleForm.reason}
              onChange={(e) => setUserRoleForm({ ...userRoleForm, reason: e.target.value })}
              multiline
              rows={3}
              placeholder="Reason for role assignment..."
            />

            <FormControlLabel
              control={
                <Switch
                  checked={userRoleForm.temporaryAccess}
                  onChange={(e) => setUserRoleForm({ ...userRoleForm, temporaryAccess: e.target.checked })}
                />
              }
              label="Temporary Access"
            />

            {userRoleForm.temporaryAccess && (
              <TextField
                label="Expires At"
                type="datetime-local"
                value={userRoleForm.expiresAt}
                onChange={(e) => setUserRoleForm({ ...userRoleForm, expiresAt: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignRole}>
            Assign Role
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openRoleDialog} onClose={() => setOpenRoleDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedRole ? 'Edit Role' : 'Create New Role'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Role Name"
              value={roleForm.name}
              onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
              fullWidth
              required
            />

            <TextField
              label="Description"
              value={roleForm.description}
              onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />

            <TextField
              label="Hierarchy Level"
              type="number"
              value={roleForm.hierarchy}
              onChange={(e) => setRoleForm({ ...roleForm, hierarchy: parseInt(e.target.value) })}
              inputProps={{ min: 1, max: 10 }}
              helperText="Higher numbers indicate more senior roles (1-10)"
            />

            <Typography variant="subtitle2">Permissions (Simplified for Demo)</Typography>
            <Alert severity="info">
              In the full implementation, this would include a comprehensive permission tree with granular controls for all CRM resources and actions.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRoleDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateRole}>
            {selectedRole ? 'Update Role' : 'Create Role'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
